import { strict as assert } from "node:assert";
import { test } from "node:test";

import { EmailDeliveryStatus, LeadLocale, PrivacyRequestStatus, PrivacyRequestType } from "@prisma/client";

import { PrivacyRequestEmailTaskDeliveryService } from "./privacy-request-email-task-delivery.service";

const request = {
  id: "request-1",
  locale: LeadLocale.ES,
  requestType: PrivacyRequestType.DELETION,
  status: PrivacyRequestStatus.RECEIVED,
  email: "visitor@example.test",
  message: "Necesito ayuda",
  privacyNoticeAcceptedAt: new Date(),
  internalNotificationStatus: EmailDeliveryStatus.PENDING,
  visitorConfirmationStatus: EmailDeliveryStatus.PENDING,
  createdAt: new Date(),
  updatedAt: new Date(),
} as never;

test("uses provider idempotency keys for durable privacy-request tasks", async () => {
  const sent: Array<{ subject: string; options?: { idempotencyKey?: string } }> = [];
  const service = new PrivacyRequestEmailTaskDeliveryService(
    { send: async (message, options) => { sent.push({ subject: message.subject, options }); return { accepted: true as const }; } },
    { apiKey: "mock-key", fromEmail: "notices@example.test", notificationTo: "privacy@example.test" },
  );

  assert.deepEqual(await service.send(request, "INTERNAL_NOTIFICATION", "privacy-request-email/task-1"), { accepted: true });
  assert.match(sent[0].subject, /Nueva solicitud de privacidad/);
  assert.equal(sent[0].options?.idempotencyKey, "privacy-request-email/task-1");
});

test("keeps privacy tasks pending when email configuration is unavailable", async () => {
  const service = new PrivacyRequestEmailTaskDeliveryService({ send: async () => ({ accepted: true as const }) }, null);
  assert.deepEqual(await service.send(request, "VISITOR_CONFIRMATION", "privacy-request-email/task-2"), { accepted: false, category: "EMAIL_PROVIDER_REJECTED" });
});
