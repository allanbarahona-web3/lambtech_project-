import { strict as assert } from "node:assert";
import { test } from "node:test";

import { ConflictException, HttpException, HttpStatus } from "@nestjs/common";
import { LeadLocale, PrivacyRequestStatus, PrivacyRequestType } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { PrivacyRequestsService } from "./privacy-requests.service";

const input = {
  email: "visitor@example.com",
  locale: LeadLocale.EN,
  privacyAccepted: true,
  requestType: PrivacyRequestType.DELETION,
};

function prismaMock(options?: { existingHash?: string; createError?: Error }) {
  const creates: Array<{ data: Record<string, unknown> }> = [];
  const prisma = {
    privacyRequestSubmission: {
      findUnique: async () => options?.existingHash ? { contentHash: options.existingHash } : null,
    },
    $transaction: async (callback: (transaction: { privacyRequest: { create(args: { data: Record<string, unknown> }): Promise<unknown> } }) => Promise<unknown>) => callback({
      privacyRequest: {
        create: async (args) => {
          creates.push(args);
          if (options?.createError) throw options.createError;
          return { id: "request-1", ...args.data };
        },
      },
    }),
  } as unknown as PrismaService;
  return { creates, prisma };
}

test("commits a privacy request and both outbox tasks in one transaction before success", async () => {
  const { creates, prisma } = prismaMock();
  const service = new PrivacyRequestsService(prisma);

  assert.deepEqual(await service.submit(input), { success: true, requestId: null });
  assert.equal(creates.length, 1);
  const data = creates[0].data;
  assert.equal(data.status, PrivacyRequestStatus.RECEIVED);
  assert.deepEqual((data.emailTasks as { create: Array<{ type: string }> }).create.map((task) => task.type), [
    "INTERNAL_NOTIFICATION",
    "VISITOR_CONFIRMATION",
  ]);
});

test("does not persist a privacy-request honeypot", async () => {
  const { creates, prisma } = prismaMock();
  assert.deepEqual(await new PrivacyRequestsService(prisma).submit({ ...input, website: "bot" }), { success: true, requestId: null });
  assert.equal(creates.length, 0);
});

test("replays matching privacy-request idempotency without another write", async () => {
  const first = prismaMock();
  await new PrivacyRequestsService(first.prisma).submit(input, "privacy-submission-key-0001");
  const hash = (first.creates[0].data.submission as { create: { contentHash: string } }).create.contentHash;
  const replay = prismaMock({ existingHash: hash });

  assert.deepEqual(await new PrivacyRequestsService(replay.prisma).submit(input, "privacy-submission-key-0001"), { success: true, requestId: null });
  assert.equal(replay.creates.length, 0);
});

test("rejects reuse of a privacy-request idempotency key with different content", async () => {
  const first = prismaMock();
  await new PrivacyRequestsService(first.prisma).submit(input, "privacy-submission-key-0002");
  const hash = (first.creates[0].data.submission as { create: { contentHash: string } }).create.contentHash;
  const replay = prismaMock({ existingHash: hash });

  await assert.rejects(
    () => new PrivacyRequestsService(replay.prisma).submit({ ...input, message: "A different privacy request." }, "privacy-submission-key-0002"),
    ConflictException,
  );
});

test("does not report success when the privacy-request transaction fails", async () => {
  const { prisma } = prismaMock({ createError: new Error("transaction failed") });
  await assert.rejects(
    () => new PrivacyRequestsService(prisma).submit(input),
    (error: unknown) => error instanceof HttpException && error.getStatus() === HttpStatus.INTERNAL_SERVER_ERROR,
  );
});
