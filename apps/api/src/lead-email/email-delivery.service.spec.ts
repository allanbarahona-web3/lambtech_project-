import { strict as assert } from "node:assert";
import { test } from "node:test";

import { ResendEmailDeliveryService } from "./email-delivery.service";
import type { LeadEmailConfiguration } from "./lead-email-configuration";

const configuration: LeadEmailConfiguration = {
  apiKey: "test-api-key",
  fromEmail: "notifications@barmentech.test",
  notificationTo: "leads@barmentech.test",
};

test("passes in-memory PNG content to the mocked Resend client and classifies rejection safely", async () => {
  const service = new ResendEmailDeliveryService(configuration);
  const sent: Array<Record<string, unknown>> = [];
  (
    service as unknown as {
      resend: {
        emails: { send: (message: Record<string, unknown>) => Promise<unknown> };
      };
    }
  ).resend = {
    emails: {
      send: async (message) => {
        sent.push(message);
        return {
          data: null,
          error: { name: "validation_error", statusCode: 422 },
        };
      },
    },
  };

  const result = await service.send({
    from: configuration.fromEmail,
    to: "visitor@example.test",
    subject: "Test",
    text: "Test",
    html: '<img src="cid:barmentech-logo" alt="Barmentech" />',
    attachments: [
      {
        filename: "barmentech-logo.png",
        content: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        contentType: "image/png",
        contentId: "barmentech-logo",
      },
    ],
  });

  assert.deepEqual(result, {
    accepted: false,
    category: "EMAIL_PROVIDER_REJECTED",
    providerErrorName: "validation_error",
    providerStatusCode: 422,
  });
  const attachment = (sent[0]?.attachments as Array<Record<string, unknown>>)[0];
  assert.ok(Buffer.isBuffer(attachment?.content));
  assert.equal(attachment?.path, undefined);
  assert.equal(attachment?.contentId, "barmentech-logo");
});
