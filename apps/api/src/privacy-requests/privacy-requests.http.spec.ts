import { strict as assert } from "node:assert";
import { test } from "node:test";

import { Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { PublicExceptionFilter } from "../http/public-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { PrivacyRequestRateLimiterService } from "./privacy-request-rate-limiter.service";
import { PrivacyRequestsController } from "./privacy-requests.controller";
import { PrivacyRequestsService } from "./privacy-requests.service";

const payload = {
  email: "privacy.visitor@example.test",
  locale: "EN",
  privacyAccepted: true,
  requestType: "ACCESS",
  website: "",
};

function createModule() {
  const created: unknown[] = [];
  const prisma = {
    privacyRequestSubmission: {
      findUnique: async () => null,
    },
    $transaction: async (callback: (transaction: { privacyRequest: { create(args: unknown): Promise<unknown> } }) => Promise<unknown>) => callback({
      privacyRequest: {
        create: async (args: unknown) => {
          created.push(args);
          return { id: `request-${created.length}`, ...((args as { data: object }).data) };
        },
      },
    }),
    privacyRequest: {
      create: async (args: unknown) => {
        created.push(args);
        return { id: `request-${created.length}`, ...((args as { data: object }).data) };
      },
    },
  } as unknown as PrismaService;

  @Module({
    controllers: [PrivacyRequestsController],
    providers: [
      PrivacyRequestsService,
      PrivacyRequestRateLimiterService,
      { provide: PrismaService, useValue: prisma },
    ],
  })
  class PrivacyRequestsHttpTestModule {}

  return { created, module: PrivacyRequestsHttpTestModule };
}

test("returns Retry-After after the privacy-request rate limit without persistence", async () => {
  const harness = createModule();
  const app = await NestFactory.create(harness.module, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const endpoint = `http://127.0.0.1:${address.port}/public/privacy-requests`;
    const body = JSON.stringify(payload);

    for (let index = 0; index < 3; index += 1) {
      const response = await fetch(endpoint, { body, headers: { "Content-Type": "application/json" }, method: "POST" });
      assert.equal(response.status, 201);
    }

    const limited = await fetch(endpoint, { body, headers: { "Content-Type": "application/json" }, method: "POST" });
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("Retry-After"), "900");
    assert.equal(harness.created.length, 3);
  } finally {
    await app.close();
  }
});

test("acknowledges a privacy-request honeypot without persistence", async () => {
  const harness = createModule();
  const app = await NestFactory.create(harness.module, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/public/privacy-requests`, {
      body: JSON.stringify({ ...payload, website: "bot" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { success: true, requestId: null });
    assert.equal(harness.created.length, 0);
  } finally {
    await app.close();
  }
});

test("rejects unknown privacy-request fields without persistence", async () => {
  const harness = createModule();
  const app = await NestFactory.create(harness.module, { logger: false });
  app.useGlobalPipes(new ValidationPipe({ disableErrorMessages: true, forbidNonWhitelisted: true, transform: true, whitelist: true }));
  app.useGlobalFilters(new PublicExceptionFilter());

  try {
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/public/privacy-requests`, {
      body: JSON.stringify({ ...payload, unexpected: "value" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Invalid request.", statusCode: 400 });
    assert.equal(harness.created.length, 0);
  } finally {
    await app.close();
  }
});
