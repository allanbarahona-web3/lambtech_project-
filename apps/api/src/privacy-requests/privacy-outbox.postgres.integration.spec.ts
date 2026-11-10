import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import { ConflictException } from "@nestjs/common";
import {
  EmailDeliveryStatus,
  LeadEmailTaskStatus,
  LeadLocale,
  PrivacyRequestEmailTaskType,
  PrivacyRequestStatus,
  PrivacyRequestType,
  PrismaClient,
} from "@prisma/client";

import { LeadEmailTaskDeliveryService } from "../lead-email/lead-email-task-delivery.service";
import { LeadEmailWorkerService } from "../lead-email/lead-email-worker.service";
import { PrismaService } from "../prisma/prisma.service";
import { PrivacyRequestEmailTaskDeliveryService } from "./privacy-request-email-task-delivery.service";
import { PrivacyRequestsService } from "./privacy-requests.service";

const testUrl = process.env.LEAD_OUTBOX_TEST_DATABASE_URL;
const enabled = process.env.LEAD_OUTBOX_POSTGRES_INTEGRATION === "1" && Boolean(testUrl);
const testEmailDomain = "privacy-outbox-test.invalid";

type SimulatedDelivery = {
  send: () => Promise<{ accepted: true } | { accepted: false; category: "EMAIL_PROVIDER_REJECTED" }>;
};

function testEmail(label: string): string {
  return `${label}-${randomUUID()}@${testEmailDomain}`;
}

function requestInput(email: string, message = "Please provide a copy of my stored data.") {
  return {
    email,
    locale: LeadLocale.EN,
    privacyAccepted: true,
    requestType: PrivacyRequestType.ACCESS,
    message,
  };
}

async function clearPrivacyTestData(prisma: PrismaClient): Promise<void> {
  const requestFilter = { email: { endsWith: `@${testEmailDomain}` } };
  await prisma.privacyRequestEmailTask.deleteMany({ where: { privacyRequest: requestFilter } });
  await prisma.privacyRequestSubmission.deleteMany({ where: { privacyRequest: requestFilter } });
  await prisma.privacyRequest.deleteMany({ where: requestFilter });
}

async function createQueuedPrivacyTask(prisma: PrismaClient, label: string) {
  const request = await prisma.privacyRequest.create({
    data: {
      locale: LeadLocale.EN,
      requestType: PrivacyRequestType.ACCESS,
      status: PrivacyRequestStatus.RECEIVED,
      email: testEmail(label),
      message: "Synthetic privacy outbox record.",
      privacyNoticeAcceptedAt: new Date(),
      internalNotificationStatus: EmailDeliveryStatus.PENDING,
      visitorConfirmationStatus: EmailDeliveryStatus.PENDING,
      emailTasks: { create: { type: PrivacyRequestEmailTaskType.INTERNAL_NOTIFICATION } },
    },
    include: { emailTasks: true },
  });
  const task = request.emailTasks[0];
  assert.ok(task);
  return { request, task };
}

function privacyWorker(prisma: PrismaClient, delivery: SimulatedDelivery): LeadEmailWorkerService {
  const worker = new LeadEmailWorkerService(
    prisma as unknown as PrismaService,
    { send: async () => ({ accepted: true as const }) } as unknown as LeadEmailTaskDeliveryService,
    delivery as unknown as PrivacyRequestEmailTaskDeliveryService,
  );
  Object.defineProperty(worker, "configuration", {
    value: {
      leaseSeconds: 60,
      maxAttempts: 3,
      pollIntervalMs: 60_000,
      sendTimeoutMs: 5_000,
      shutdownTimeoutMs: 1_000,
      visitorConfirmationMaxPerRecipient: 3,
      visitorConfirmationWindowSeconds: 86_400,
    },
  });
  return worker;
}

test("PostgreSQL privacy outbox: transactions, idempotency, retries, leases, and concurrent claims", { skip: !enabled }, async (context) => {
  const primary = new PrismaClient({ datasources: { db: { url: testUrl } } });
  const secondary = new PrismaClient({ datasources: { db: { url: testUrl } } });
  await primary.$connect();
  await secondary.$connect();
  context.after(async () => {
    await clearPrivacyTestData(primary);
    await primary.$disconnect();
    await secondary.$disconnect();
  });

  await context.test("commits one privacy request with exactly two tasks atomically", async () => {
    await clearPrivacyTestData(primary);
    const email = testEmail("atomic");
    await new PrivacyRequestsService(primary as unknown as PrismaService).submit(requestInput(email), `privacy-atomic-${randomUUID()}`);
    const request = await primary.privacyRequest.findFirstOrThrow({
      where: { email },
      include: { emailTasks: true, submission: true },
    });
    assert.equal(request.status, PrivacyRequestStatus.RECEIVED);
    assert.equal(request.emailTasks.length, 2);
    assert.deepEqual(
      request.emailTasks.map((task) => task.type).sort(),
      [PrivacyRequestEmailTaskType.INTERNAL_NOTIFICATION, PrivacyRequestEmailTaskType.VISITOR_CONFIRMATION].sort(),
    );
    assert.ok(request.submission);
  });

  await context.test("replays matching idempotency and rejects different content without duplicates", async () => {
    await clearPrivacyTestData(primary);
    const email = testEmail("replay");
    const input = requestInput(email);
    const key = `privacy-replay-${randomUUID()}`;
    const service = new PrivacyRequestsService(primary as unknown as PrismaService);
    await service.submit(input, key);
    await service.submit(input, key);
    await assert.rejects(
      () => service.submit({ ...input, message: "A different valid privacy request." }, key),
      ConflictException,
    );
    assert.equal(await primary.privacyRequest.count({ where: { email } }), 1);
    assert.equal(await primary.privacyRequestSubmission.count({ where: { idempotencyKey: key } }), 1);
    assert.equal(await primary.privacyRequestEmailTask.count({ where: { privacyRequest: { email } } }), 2);
  });

  await context.test("concurrent matching privacy submissions create one request and two tasks", async () => {
    await clearPrivacyTestData(primary);
    const email = testEmail("concurrent-submission");
    const key = `privacy-concurrent-${randomUUID()}`;
    const input = requestInput(email);
    await Promise.all([
      new PrivacyRequestsService(primary as unknown as PrismaService).submit(input, key),
      new PrivacyRequestsService(secondary as unknown as PrismaService).submit(input, key),
    ]);
    assert.equal(await primary.privacyRequest.count({ where: { email } }), 1);
    assert.equal(await primary.privacyRequestSubmission.count({ where: { idempotencyKey: key } }), 1);
    assert.equal(await primary.privacyRequestEmailTask.count({ where: { privacyRequest: { email } } }), 2);
  });

  await context.test("retries a simulated provider failure with backoff and then completes", async () => {
    await clearPrivacyTestData(primary);
    const { task } = await createQueuedPrivacyTask(primary, "retry");
    let attempts = 0;
    const worker = privacyWorker(primary, {
      send: async () => {
        attempts += 1;
        return attempts === 1
          ? { accepted: false as const, category: "EMAIL_PROVIDER_REJECTED" as const }
          : { accepted: true as const };
      },
    });
    assert.equal(await worker.runOnce(), true);
    const retry = await primary.privacyRequestEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(retry.status, LeadEmailTaskStatus.PENDING);
    assert.equal(retry.attempts, 1);
    assert.equal(retry.lastErrorCode, "EMAIL_PROVIDER_REJECTED");
    assert.ok(retry.availableAt.getTime() > Date.now());

    await primary.privacyRequestEmailTask.update({ where: { id: task.id }, data: { availableAt: new Date(Date.now() - 1_000) } });
    assert.equal(await worker.runOnce(), true);
    const completed = await primary.privacyRequestEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(completed.status, LeadEmailTaskStatus.SENT);
    assert.equal(completed.attempts, 2);
    assert.equal(completed.lastErrorCode, null);
  });

  await context.test("reclaims an expired privacy-task lease", async () => {
    await clearPrivacyTestData(primary);
    const { task } = await createQueuedPrivacyTask(primary, "lease");
    await primary.privacyRequestEmailTask.update({
      where: { id: task.id },
      data: {
        status: LeadEmailTaskStatus.PROCESSING,
        attempts: 1,
        leaseToken: randomUUID(),
        leasedAt: new Date(Date.now() - 120_000),
        leaseExpiresAt: new Date(Date.now() - 60_000),
      },
    });
    assert.equal(await privacyWorker(primary, { send: async () => ({ accepted: true as const }) }).runOnce(), true);
    const completed = await primary.privacyRequestEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(completed.status, LeadEmailTaskStatus.SENT);
    assert.equal(completed.attempts, 2);
    assert.equal(completed.leaseToken, null);
  });

  await context.test("independent PostgreSQL workers claim a privacy task only once", async () => {
    await clearPrivacyTestData(primary);
    const { task } = await createQueuedPrivacyTask(primary, "concurrent-claim");
    let sends = 0;
    const delivery: SimulatedDelivery = { send: async () => { sends += 1; return { accepted: true as const }; } };
    const results = await Promise.all([
      privacyWorker(primary, delivery).runOnce(),
      privacyWorker(secondary, delivery).runOnce(),
    ]);
    const completed = await primary.privacyRequestEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(sends, 1);
    assert.equal(completed.status, LeadEmailTaskStatus.SENT);
    assert.equal(completed.attempts, 1);
  });
});
