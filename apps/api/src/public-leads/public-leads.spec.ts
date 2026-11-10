import { strict as assert } from "node:assert";
import { test } from "node:test";

import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { LeadInterest, LeadLocale, LeadSourceSite } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { PublicLeadRateLimiterService } from "./public-lead-rate-limiter.service";
import { PublicLeadsService } from "./public-leads.service";

const lead: CreatePublicLeadDto = {
  fullName: "Ada Lovelace", email: "ada@example.com", country: "Costa Rica",
  interest: LeadInterest.COMPANY_FORMATION, message: "I need help forming a company.",
  locale: LeadLocale.EN, sourceSite: LeadSourceSite.FORMATION, privacyAccepted: true,
};

function prismaMock(options?: { existingHash?: string; createError?: Error }) {
  const creates: unknown[] = [];
  const prisma = {
    leadSubmission: {
      findUnique: async () => options?.existingHash ? { contentHash: options.existingHash } : null,
      create: async (args: unknown) => { creates.push(args); if (options?.createError) throw options.createError; return {}; },
    },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback({ leadSubmission: { create: async (args: unknown) => { creates.push(args); if (options?.createError) throw options.createError; return {}; } } }),
  } as unknown as PrismaService;
  return { prisma, creates };
}

test("commits a lead and both outbox tasks in one transaction before success", async () => {
  const { prisma, creates } = prismaMock();
  const service = new PublicLeadsService(prisma);
  assert.deepEqual(await service.submit(lead, "submission-key-0001", "correlation-1"), { success: true, leadId: null });
  assert.equal(creates.length, 1);
  const data = (creates[0] as { data: { lead: { create: { emailTasks: { create: unknown[] } } } } }).data;
  assert.equal(data.lead.create.emailTasks.create.length, 2);
});

test("replays a matching idempotency key without creating another lead", async () => {
  const first = prismaMock();
  const service = new PublicLeadsService(first.prisma);
  await service.submit(lead, "submission-key-0002", "correlation-2");
  const hash = (first.creates[0] as { data: { contentHash: string } }).data.contentHash;
  const replay = prismaMock({ existingHash: hash });
  assert.deepEqual(await new PublicLeadsService(replay.prisma).submit(lead, "submission-key-0002", "correlation-3"), { success: true, leadId: null });
  assert.equal(replay.creates.length, 0);
});

test("rejects reuse of an idempotency key with different content", async () => {
  const first = prismaMock();
  await new PublicLeadsService(first.prisma).submit(lead, "submission-key-0003", "correlation-4");
  const hash = (first.creates[0] as { data: { contentHash: string } }).data.contentHash;
  const replay = prismaMock({ existingHash: hash });
  await assert.rejects(() => new PublicLeadsService(replay.prisma).submit({ ...lead, message: "A different valid message." }, "submission-key-0003", "correlation-5"), ConflictException);
});

test("does not report success when the transaction fails", async () => {
  const { prisma } = prismaMock({ createError: new Error("transaction failed") });
  await assert.rejects(() => new PublicLeadsService(prisma).submit(lead, "submission-key-0004", "correlation-6"), (error: unknown) => error instanceof HttpException && error.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR);
});

test("uses the documented twelve-per-window default and supplies retry time", () => {
  const limiter = new PublicLeadRateLimiterService();
  for (let index = 0; index < 12; index += 1) assert.equal(limiter.consume("192.0.2.10", 0).allowed, true);
  assert.deepEqual(limiter.consume("192.0.2.10", 0), { allowed: false, retryAfterSeconds: 900 });
  assert.equal(limiter.consume("192.0.2.10", 900_000).allowed, true);
});

test("removes expired public-lead keys before applying the memory cap", () => {
  const limiter = new PublicLeadRateLimiterService();
  for (let index = 0; index < 10_000; index += 1) {
    assert.equal(limiter.consume(`client-${index}`, 0).allowed, true);
  }
  assert.equal(limiter.consume("client-after-window", 900_000).allowed, true);
});
