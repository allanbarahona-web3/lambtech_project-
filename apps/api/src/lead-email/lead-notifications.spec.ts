import { strict as assert } from "node:assert";
import { test } from "node:test";

import { HttpException } from "@nestjs/common";
import {
  EmailDeliveryStatus,
  LeadInterest,
  LeadLocale,
  LeadSourceSite,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicLeadDto } from "../public-leads/dto/create-public-lead.dto";
import { PublicLeadsService } from "../public-leads/public-leads.service";
import {
  type EmailDeliveryService,
  type EmailDeliveryResult,
  type TransactionalEmail,
} from "./email-delivery.service";
import {
  getLeadEmailConfiguration,
  type LeadEmailConfiguration,
} from "./lead-email-configuration";
import {
  type LeadNotificationRecord,
  LeadNotificationsService,
} from "./lead-notifications.service";
import { LeadEmailAssetError } from "./lead-email-logo";

function leadRecord(
  overrides: Partial<LeadNotificationRecord> = {},
): LeadNotificationRecord {
  return {
    id: "lead-123",
    sourceSite: LeadSourceSite.FORMATION,
    locale: LeadLocale.EN,
    interest: LeadInterest.COMPANY_FORMATION,
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    country: "Costa Rica",
    company: "Analytical Engines",
    message: "I need help forming a company.",
    privacyConsentAt: new Date("2026-10-27T10:00:00.000Z"),
    campaign: "autumn-launch",
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    createdAt: new Date("2026-10-27T10:01:00.000Z"),
    ...overrides,
  };
}

function emailConfiguration(): LeadEmailConfiguration {
  return {
    apiKey: "test-api-key",
    fromEmail: "notifications@barmentech.test",
    notificationTo: "leads@barmentech.test",
  };
}

function createDeliveryMock(
  outcomes: Array<boolean | EmailDeliveryResult | Error>,
) {
  const messages: TransactionalEmail[] = [];
  const delivery = {
    send: async (message: TransactionalEmail) => {
      messages.push(message);
      const outcome = outcomes.shift() ?? false;
      if (outcome instanceof Error) {
        throw outcome;
      }
      if (typeof outcome === "boolean") {
        return outcome
          ? { accepted: true }
          : { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };
      }
      return outcome;
    },
  } satisfies EmailDeliveryService;

  return { delivery, messages };
}

function createPrismaMock(options?: { updateError?: boolean }) {
  const updates: Array<{ data: Record<string, unknown> }> = [];
  const prisma = {
    lead: {
      update: async (arguments_: { data: Record<string, unknown> }) => {
        updates.push(arguments_);
        if (options?.updateError) {
          throw new Error("status update failed");
        }
        return {};
      },
    },
  } as unknown as PrismaService;

  return { prisma, updates };
}

function createNotificationsService(options?: {
  configuration?: LeadEmailConfiguration | null;
  outcomes?: Array<boolean | EmailDeliveryResult | Error>;
  updateError?: boolean;
}) {
  const { prisma, updates } = createPrismaMock({
    updateError: options?.updateError,
  });
  const { delivery, messages } = createDeliveryMock(options?.outcomes ?? []);
  const service = new LeadNotificationsService(
    prisma,
    delivery,
    options?.configuration === undefined
      ? emailConfiguration()
      : options.configuration,
  );
  const logs: string[] = [];
  (
    service as unknown as { logger: { warn: (message: string) => void } }
  ).logger.warn = (message: string) => {
    logs.push(message);
  };

  return { delivery, logs, messages, prisma, service, updates };
}

function statuses(
  updates: Array<{ data: Record<string, unknown> }>,
): Array<Record<string, unknown>> {
  return updates.map((update) => update.data);
}

test("sends internal and English visitor messages, then records both as sent", async () => {
  const { messages, service, updates } = createNotificationsService({
    outcomes: [true, true],
  });

  await service.notify(leadRecord());

  assert.equal(messages.length, 2);
  assert.equal(messages[0]?.to, "leads@barmentech.test");
  assert.equal(messages[0]?.replyTo, "ada@example.com");
  assert.ok(Buffer.isBuffer(messages[0]?.attachments?.[0]?.content));
  assert.equal(messages[0]?.attachments?.[0]?.path, undefined);
  assert.match(messages[0]?.subject ?? "", /New inquiry: U\.S\. company formation/);
  assert.match(messages[0]?.text ?? "", /Lead ID: lead-123/);
  assert.equal(messages[1]?.to, "ada@example.com");
  assert.equal(
    messages[1]?.subject,
    "We received your inquiry | Barmentech Formation",
  );
  assert.match(messages[1]?.text ?? "", /do not email passwords/i);
  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.SENT },
    { visitorConfirmationStatus: EmailDeliveryStatus.SENT },
  ]);
});
test("sends a Spanish visitor confirmation for a persisted Spanish lead", async () => {
  const { messages, service } = createNotificationsService({
    outcomes: [true, true],
  });

  await service.notify(leadRecord({ locale: LeadLocale.ES }));

  assert.equal(
    messages[1]?.subject,
    "Recibimos tu solicitud | Barmentech Formation",
  );
  assert.match(messages[1]?.text ?? "", /Gracias por contactar a Barmentech/);
});

test("records independent outcomes when the internal message succeeds and visitor message fails", async () => {
  const { service, updates } = createNotificationsService({
    outcomes: [true, false],
  });

  await service.notify(leadRecord());

  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.SENT },
    { visitorConfirmationStatus: EmailDeliveryStatus.FAILED },
  ]);
});
test("records independent outcomes when the internal message fails and visitor message succeeds", async () => {
  const { service, updates } = createNotificationsService({
    outcomes: [false, true],
  });

  await service.notify(leadRecord());

  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.FAILED },
    { visitorConfirmationStatus: EmailDeliveryStatus.SENT },
  ]);
});

test("logs a sanitized provider rejection without personal data or secrets", async () => {
  const { logs, service, updates } = createNotificationsService({
    outcomes: [
      {
        accepted: false,
        category: "EMAIL_PROVIDER_REJECTED",
        providerErrorName: "validation_error",
        providerStatusCode: 422,
      },
      { accepted: true },
    ],
  });

  await service.notify(leadRecord());

  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.FAILED },
    { visitorConfirmationStatus: EmailDeliveryStatus.SENT },
  ]);
  assert.equal(logs.length, 1);
  assert.equal(
    logs[0],
    JSON.stringify({
      leadId: "lead-123",
      deliveryType: "internal",
      category: "EMAIL_PROVIDER_REJECTED",
      providerStatusCode: 422,
      providerErrorName: "validation_error",
    }),
  );
  assert.doesNotMatch(logs[0] ?? "", /ada@example\.com|Ada Lovelace|test-api-key|assets/);
});

test("categorizes asset and template construction failures without logging raw errors", async () => {
  const { logs, service, updates } = createNotificationsService({
    outcomes: [],
  });
  const internals = service as unknown as {
    sendAndRecord: (
      leadId: string,
      deliveryType: "internal" | "visitor",
      statusField: "internalNotificationStatus" | "visitorConfirmationStatus",
      createMessage: () => TransactionalEmail,
    ) => Promise<void>;
  };

  await internals.sendAndRecord(
    "lead-123",
    "internal",
    "internalNotificationStatus",
    () => {
      throw new LeadEmailAssetError("EMAIL_ASSET_NOT_FOUND");
    },
  );
  await internals.sendAndRecord(
    "lead-123",
    "visitor",
    "visitorConfirmationStatus",
    () => {
      throw new Error("Ada Lovelace /home/private/assets/barmentech-logo.png");
    },
  );

  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.FAILED },
    { visitorConfirmationStatus: EmailDeliveryStatus.FAILED },
  ]);
  assert.deepEqual(logs, [
    JSON.stringify({
      leadId: "lead-123",
      deliveryType: "internal",
      category: "EMAIL_ASSET_NOT_FOUND",
    }),
    JSON.stringify({
      leadId: "lead-123",
      deliveryType: "visitor",
      category: "EMAIL_TEMPLATE_FAILED",
    }),
  ]);
  assert.doesNotMatch(logs.join(" "), /Ada Lovelace|private|assets/);
});

test("marks both delivery statuses failed when email configuration is unavailable", async () => {
  const { messages, service, updates } = createNotificationsService({
    configuration: null,
  });

  await service.notify(leadRecord());

  assert.equal(messages.length, 0);
  assert.deepEqual(statuses(updates), [
    { internalNotificationStatus: EmailDeliveryStatus.FAILED },
    { visitorConfirmationStatus: EmailDeliveryStatus.FAILED },
  ]);
});

test("rejects incomplete, invalid, and header-injection email configuration without revealing values", () => {
  assert.equal(getLeadEmailConfiguration({}), null);
  assert.throws(
    () => getLeadEmailConfiguration({ RESEND_API_KEY: "test-api-key" }),
    /must be configured together/,
  );
  assert.throws(
    () =>
      getLeadEmailConfiguration({
        RESEND_API_KEY: "test-api-key",
        RESEND_FROM_EMAIL: "not-an-email",
        LEADS_NOTIFICATION_TO: "leads@barmentech.test",
      }),
    /must be a valid email address/,
  );
  assert.throws(
    () =>
      getLeadEmailConfiguration({
        RESEND_API_KEY: "test-api-key",
        RESEND_FROM_EMAIL: "notifications@barmentech.test\nBcc: injected@example.test",
        LEADS_NOTIFICATION_TO: "leads@barmentech.test",
      }),
    /must not contain control characters/,
  );
});

test("escapes unsafe lead content in HTML while preserving readable plain text", async () => {
  const { messages, service } = createNotificationsService({
    outcomes: [true, true],
  });
  const unsafeMessage = "<img src=x onerror=alert(1)> & details";

  await service.notify(
    leadRecord({ fullName: "<Ada & Co>", message: unsafeMessage }),
  );

  assert.doesNotMatch(messages[0]?.html ?? "", /<img src=x/);
  assert.match(messages[0]?.html ?? "", /&lt;img src=x onerror=alert\(1\)&gt; &amp; details/);
  assert.match(messages[0]?.text ?? "", /<img src=x onerror=alert\(1\)> & details/);
});

test("does not resend when a delivery-status update fails", async () => {
  const { logs, messages, service, updates } = createNotificationsService({
    outcomes: [true, true],
    updateError: true,
  });

  await service.notify(leadRecord());

  assert.equal(messages.length, 2);
  assert.equal(updates.length, 2);
  assert.deepEqual(logs, [
    JSON.stringify({
      leadId: "lead-123",
      deliveryType: "internal",
      category: "EMAIL_STATUS_UPDATE_FAILED",
    }),
    JSON.stringify({
      leadId: "lead-123",
      deliveryType: "visitor",
      category: "EMAIL_STATUS_UPDATE_FAILED",
    }),
  ]);
});
