import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import { Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { LeadSourceSite } from "@prisma/client";

import { PublicExceptionFilter } from "../http/public-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { PublicLeadRateLimiterService } from "./public-lead-rate-limiter.service";
import { PublicLeadsController } from "./public-leads.controller";
import {
  PUBLIC_LEAD_SOURCE_SITE_ORIGINS,
  PublicLeadSourceSiteResolver,
} from "./public-lead-source-site.resolver";
import { PublicLeadsService } from "./public-leads.service";

const sourceSiteOrigins = new Map<string, LeadSourceSite>([
  ["https://formation.example.test", LeadSourceSite.FORMATION],
  ["https://technology.example.test", LeadSourceSite.TECHNOLOGY],
]);

function createPrismaHarness() {
  const submissions = new Map<string, { contentHash: string }>();
  let creates = 0;
  const prisma = {
    leadSubmission: {
      findUnique: async ({ where }: { where: { idempotencyKey: string } }) =>
        submissions.get(where.idempotencyKey) ?? null,
    },
    $transaction: async (callback: (transaction: { leadSubmission: { create(args: { data: { contentHash: string; idempotencyKey: string } }): Promise<unknown> } }) => Promise<unknown>) =>
      callback({
        leadSubmission: {
          create: async ({ data }) => {
            creates += 1;
            submissions.set(data.idempotencyKey, {
              contentHash: data.contentHash,
            });
            return {};
          },
        },
      }),
  } as unknown as PrismaService;

  return {
    creates: () => creates,
    prisma,
  };
}

function createModule(prisma: PrismaService) {
  @Module({
    controllers: [PublicLeadsController],
    providers: [
      PublicLeadsService,
      PublicLeadRateLimiterService,
      PublicLeadSourceSiteResolver,
      { provide: PUBLIC_LEAD_SOURCE_SITE_ORIGINS, useValue: sourceSiteOrigins },
      { provide: PrismaService, useValue: prisma },
    ],
  })
  class PublicLeadsHttpTestModule {}

  return PublicLeadsHttpTestModule;
}

const formationPayload = {
  fullName: "Test Visitor",
  email: "test.visitor@example.test",
  country: "Costa Rica",
  interest: "COMPANY_FORMATION",
  locale: "EN",
  message: "I need help forming a company.",
  privacyAccepted: true,
  sourceSite: "FORMATION",
  website: "",
};

test("accepts the Formation payload with Idempotency-Key and replays it without another write", async () => {
  const harness = createPrismaHarness();
  const app = await NestFactory.create(createModule(harness.prisma), {
    logger: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const endpoint = `http://127.0.0.1:${address.port}/public/leads`;
    const body = JSON.stringify(formationPayload);

    const missingKey = await fetch(endpoint, {
      body,
      headers: { "Content-Type": "application/json", Origin: "https://formation.example.test" },
      method: "POST",
    });
    assert.equal(missingKey.status, 400);
    assert.deepEqual(await missingKey.json(), {
      message: "Invalid request.",
      statusCode: 400,
    });

    const idempotencyKey = randomUUID();
    const request = {
      body,
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        Origin: "https://formation.example.test",
      },
      method: "POST",
    };
    const first = await fetch(endpoint, request);
    assert.equal(first.status, 201);
    assert.deepEqual(await first.json(), { success: true, leadId: null });

    const replay = await fetch(endpoint, request);
    assert.equal(replay.status, 201);
    assert.deepEqual(await replay.json(), { success: true, leadId: null });
    assert.equal(harness.creates(), 1);
  } finally {
    await app.close();
  }
});

test("resolves the site from an exact recognized Origin and rejects absent, unknown, or contradictory claims", async () => {
  const harness = createPrismaHarness();
  const app = await NestFactory.create(createModule(harness.prisma), { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const endpoint = `http://127.0.0.1:${address.port}/public/leads`;

    const technology = await fetch(endpoint, {
      body: JSON.stringify({ ...formationPayload, interest: "TECHNOLOGY_AND_DIGITAL", sourceSite: "TECHNOLOGY" }),
      headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID(), Origin: "https://technology.example.test" },
      method: "POST",
    });
    assert.equal(technology.status, 201);

    const rejectedRequests: Array<{ body: string; headers: Record<string, string> }> = [
      { body: JSON.stringify(formationPayload), headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID() } },
      { body: JSON.stringify(formationPayload), headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID(), Origin: "https://unknown.example.test" } },
      { body: JSON.stringify({ ...formationPayload, sourceSite: "TECHNOLOGY" }), headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID(), Origin: "https://formation.example.test" } },
    ];
    for (const request of rejectedRequests) {
      const response = await fetch(endpoint, {
        body: request.body,
        headers: request.headers,
        method: "POST",
      });
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), { message: "Invalid request.", statusCode: 400 });
    }
    assert.equal(harness.creates(), 1);
  } finally {
    await app.close();
  }
});

test("returns Retry-After after the public-lead rate limit without another write", async () => {
  const harness = createPrismaHarness();
  const app = await NestFactory.create(createModule(harness.prisma), { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const endpoint = `http://127.0.0.1:${address.port}/public/leads`;
    const body = JSON.stringify(formationPayload);

    for (let index = 0; index < 12; index += 1) {
      const response = await fetch(endpoint, {
        body,
        headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID(), Origin: "https://formation.example.test" },
        method: "POST",
      });
      assert.equal(response.status, 201);
    }

    const limited = await fetch(endpoint, {
      body,
      headers: { "Content-Type": "application/json", "Idempotency-Key": randomUUID(), Origin: "https://formation.example.test" },
      method: "POST",
    });
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("Retry-After"), "900");
    assert.equal(harness.creates(), 12);
  } finally {
    await app.close();
  }
});

test("acknowledges a public-lead honeypot without requiring an idempotency key or writing", async () => {
  const harness = createPrismaHarness();
  const app = await NestFactory.create(createModule(harness.prisma), { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/public/leads`, {
      body: JSON.stringify({ ...formationPayload, website: "bot" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { success: true, leadId: null });
    assert.equal(harness.creates(), 0);
  } finally {
    await app.close();
  }
});
