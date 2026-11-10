import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import {
  EmailDeliveryStatus,
  LeadEmailTaskStatus,
  LeadEmailTaskType,
  LeadInterest,
  LeadLocale,
  LeadSourceSite,
  PrismaClient,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicLeadDto } from "../public-leads/dto/create-public-lead.dto";
import { PublicLeadsService } from "../public-leads/public-leads.service";
import { LeadEmailTaskDeliveryService } from "./lead-email-task-delivery.service";
import { LeadEmailWorkerService } from "./lead-email-worker.service";

const testUrl = process.env.LEAD_OUTBOX_TEST_DATABASE_URL;
const enabled = process.env.LEAD_OUTBOX_POSTGRES_INTEGRATION === "1" && Boolean(testUrl);
const testEmailDomain = "lead-outbox-test.invalid";

type Delivery = { send: () => Promise<{ accepted: true }> };

function worker(prisma: PrismaClient, delivery: Delivery): LeadEmailWorkerService {
  const instance = new LeadEmailWorkerService(
    prisma as unknown as PrismaService,
    delivery as unknown as LeadEmailTaskDeliveryService,
  );
  Object.defineProperty(instance, "configuration", {
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
  return instance;
}

async function clearTestData(prisma: PrismaClient): Promise<void> {
  const leadFilter = { email: { endsWith: `@${testEmailDomain}` } };
  await prisma.leadEmailTask.deleteMany({ where: { lead: leadFilter } });
  await prisma.leadSubmission.deleteMany({ where: { lead: leadFilter } });
  await prisma.lead.deleteMany({ where: leadFilter });
}

async function createLead(prisma: Pick<PrismaClient, "lead">, email: string) {
  return prisma.lead.create({
    data: {
      sourceSite: LeadSourceSite.FORMATION,
      locale: LeadLocale.EN,
      interest: LeadInterest.COMPANY_FORMATION,
      fullName: "Integration Test",
      email,
      country: "Test country",
      message: "Integration test record only.",
      privacyConsentAt: new Date(),
      internalNotificationStatus: EmailDeliveryStatus.PENDING,
      visitorConfirmationStatus: EmailDeliveryStatus.PENDING,
    },
  });
}

async function createTask(
  prisma: PrismaClient,
  email: string,
  type: LeadEmailTaskType,
  status: LeadEmailTaskStatus = LeadEmailTaskStatus.PENDING,
) {
  const lead = await createLead(prisma, email);
  return prisma.leadEmailTask.create({
    data: {
      leadId: lead.id,
      type,
      status,
      ...(status === LeadEmailTaskStatus.SENT ? { completedAt: new Date() } : {}),
    },
  });
}

function integrationEmail(label: string): string {
  return `${label}-${randomUUID()}@${testEmailDomain}`;
}

test("PostgreSQL integration: claims, leases, transactions, idempotency, and recipient caps", { skip: !enabled }, async (context) => {
  const primary = new PrismaClient({ datasources: { db: { url: testUrl } } });
  const secondary = new PrismaClient({ datasources: { db: { url: testUrl } } });
  await primary.$connect();
  await secondary.$connect();
  context.after(async () => {
    await clearTestData(primary);
    await primary.$disconnect();
    await secondary.$disconnect();
  });

  await context.test("SKIP LOCKED allows only one independent worker to claim a task", async () => {
    await clearTestData(primary);
    const task = await createTask(primary, integrationEmail("claim"), LeadEmailTaskType.INTERNAL_NOTIFICATION);
    let sends = 0;
    const delivery: Delivery = { send: async () => { sends += 1; return { accepted: true }; } };
    const results = await Promise.all([worker(primary, delivery).runOnce(), worker(secondary, delivery).runOnce()]);
    const persisted = await primary.leadEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(sends, 1);
    assert.equal(persisted.status, LeadEmailTaskStatus.SENT);
    assert.equal(persisted.attempts, 1);
  });

  await context.test("an expired lease is reclaimed and an obsolete claimant cannot overwrite its successor", async () => {
    await clearTestData(primary);
    const task = await createTask(primary, integrationEmail("lease"), LeadEmailTaskType.INTERNAL_NOTIFICATION, LeadEmailTaskStatus.PROCESSING);
    await primary.leadEmailTask.update({
      where: { id: task.id },
      data: { attempts: 1, leaseToken: randomUUID(), leasedAt: new Date(Date.now() - 120_000), leaseExpiresAt: new Date(Date.now() - 60_000) },
    });

    let release!: () => void;
    let acceptedByFirst!: () => void;
    const firstAccepted = new Promise<void>((resolve) => { acceptedByFirst = resolve; });
    const blockedDelivery: Delivery = { send: async () => {
      acceptedByFirst();
      await new Promise<void>((resolve) => { release = resolve; });
      return { accepted: true };
    } };
    const first = worker(primary, blockedDelivery).runOnce();
    await firstAccepted;
    await secondary.leadEmailTask.update({ where: { id: task.id }, data: { leaseExpiresAt: new Date(Date.now() - 1_000) } });
    const second = await worker(secondary, { send: async () => ({ accepted: true }) }).runOnce();
    release();
    await first;

    const persisted = await primary.leadEmailTask.findUniqueOrThrow({ where: { id: task.id } });
    assert.equal(second, true);
    assert.equal(persisted.status, LeadEmailTaskStatus.SENT);
    assert.equal(persisted.attempts, 3);
    assert.equal(persisted.leaseToken, null);
  });

  await context.test("a database error rolls back the lead, submission, and all outbox rows", async () => {
    await clearTestData(primary);
    const email = integrationEmail("rollback");
    await assert.rejects(() => primary.$transaction(async (transaction) => {
      const lead = await createLead(transaction, email);
      await transaction.leadSubmission.create({ data: { idempotencyKey: `rollback-${randomUUID()}`, contentHash: "a".repeat(64), leadId: lead.id } });
      await transaction.leadEmailTask.create({ data: { leadId: lead.id, type: LeadEmailTaskType.INTERNAL_NOTIFICATION } });
      await transaction.leadEmailTask.create({ data: { leadId: lead.id, type: LeadEmailTaskType.INTERNAL_NOTIFICATION } });
    }));
    assert.equal(await primary.lead.count({ where: { email } }), 0);
    assert.equal(await primary.leadSubmission.count({ where: { lead: { email } } }), 0);
    assert.equal(await primary.leadEmailTask.count({ where: { lead: { email } } }), 0);
  });

  await context.test("simultaneous matching idempotency keys create one lead, one submission, and two tasks", async () => {
    await clearTestData(primary);
    const email = integrationEmail("idempotency");
    const dto: CreatePublicLeadDto = {
      fullName: "Integration Test",
      email,
      country: "Test country",
      interest: LeadInterest.COMPANY_FORMATION,
      message: "Integration test record only.",
      locale: LeadLocale.EN,
      sourceSite: LeadSourceSite.FORMATION,
      privacyAccepted: true,
    };
    const key = `integration-${randomUUID()}`;
    const first = new PublicLeadsService(primary as unknown as PrismaService).submit(dto, key, "integration-a");
    const second = new PublicLeadsService(secondary as unknown as PrismaService).submit(dto, key, "integration-b");
    await Promise.all([first, second]);
    assert.equal(await primary.lead.count({ where: { email } }), 1);
    assert.equal(await primary.leadSubmission.count({ where: { idempotencyKey: key } }), 1);
    assert.equal(await primary.leadEmailTask.count({ where: { lead: { email } } }), 2);
  });

  await context.test("concurrent workers reserve no more than three visitor confirmations per recipient", async () => {
    await clearTestData(primary);
    const email = integrationEmail("recipient-limit");
    await createTask(primary, email, LeadEmailTaskType.VISITOR_CONFIRMATION, LeadEmailTaskStatus.SENT);
    await createTask(primary, email, LeadEmailTaskType.VISITOR_CONFIRMATION, LeadEmailTaskStatus.SENT);
    await createTask(primary, email, LeadEmailTaskType.VISITOR_CONFIRMATION);
    await createTask(primary, email, LeadEmailTaskType.VISITOR_CONFIRMATION);
    let sends = 0;
    const delivery: Delivery = { send: async () => { sends += 1; return { accepted: true }; } };
    await Promise.all([worker(primary, delivery).runOnce(), worker(secondary, delivery).runOnce()]);
    const sent = await primary.leadEmailTask.count({ where: { lead: { email }, type: LeadEmailTaskType.VISITOR_CONFIRMATION, status: LeadEmailTaskStatus.SENT } });
    const limited = await primary.leadEmailTask.count({ where: { lead: { email }, lastErrorCode: "RECIPIENT_CONFIRMATION_RATE_LIMITED" } });
    assert.ok(sent <= 3);
    assert.ok(sends <= 1);
    assert.ok(limited >= 1);
  });
});
