import { Inject, Injectable } from "@nestjs/common";
import type { PrivacyRequest } from "@prisma/client";

import {
  EMAIL_DELIVERY_SERVICE,
  type EmailDeliveryResult,
  type EmailDeliveryService,
  type TransactionalEmail,
} from "../lead-email/email-delivery.service";
import {
  LEAD_EMAIL_CONFIGURATION,
  type LeadEmailConfiguration,
} from "../lead-email/lead-email-configuration";
import {
  createInternalPrivacyRequestTemplate,
  createVisitorPrivacyRequestTemplate,
} from "./privacy-request-email-templates";

export type PrivacyRequestEmailTaskType =
  | "INTERNAL_NOTIFICATION"
  | "VISITOR_CONFIRMATION";

@Injectable()
export class PrivacyRequestEmailTaskDeliveryService {
  constructor(
    @Inject(EMAIL_DELIVERY_SERVICE) private readonly delivery: EmailDeliveryService,
    @Inject(LEAD_EMAIL_CONFIGURATION) private readonly configuration: LeadEmailConfiguration | null,
  ) {}

  async send(
    request: PrivacyRequest,
    type: PrivacyRequestEmailTaskType,
    idempotencyKey: string,
  ): Promise<EmailDeliveryResult> {
    const configuration = this.configuration;
    if (!configuration) {
      return { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };
    }

    try {
      const message: TransactionalEmail = type === "INTERNAL_NOTIFICATION"
        ? {
            from: configuration.fromEmail,
            to: configuration.notificationTo,
            replyTo: request.email,
            ...createInternalPrivacyRequestTemplate(request),
          }
        : {
            from: configuration.fromEmail,
            to: request.email,
            ...createVisitorPrivacyRequestTemplate(request),
          };
      return await this.delivery.send(message, { idempotencyKey });
    } catch {
      return { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };
    }
  }
}
