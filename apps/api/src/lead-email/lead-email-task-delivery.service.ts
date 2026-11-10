import { Inject, Injectable } from "@nestjs/common";
import { LeadEmailTaskType } from "@prisma/client";

import {
  EMAIL_DELIVERY_SERVICE,
  type EmailDeliveryResult,
  type EmailDeliveryService,
  type TransactionalEmail,
} from "./email-delivery.service";
import { LEAD_EMAIL_CONFIGURATION, type LeadEmailConfiguration } from "./lead-email-configuration";
import { LeadEmailAssetError } from "./lead-email-logo";
import { createInternalLeadNotificationTemplate, createVisitorConfirmationTemplate } from "./lead-email-templates";
import type { LeadNotificationRecord } from "./lead-notifications.service";

@Injectable()
export class LeadEmailTaskDeliveryService {
  constructor(
    @Inject(EMAIL_DELIVERY_SERVICE) private readonly delivery: EmailDeliveryService,
    @Inject(LEAD_EMAIL_CONFIGURATION) private readonly configuration: LeadEmailConfiguration | null,
  ) {}

  async send(lead: LeadNotificationRecord, type: LeadEmailTaskType, idempotencyKey: string): Promise<EmailDeliveryResult> {
    const configuration = this.configuration;
    if (!configuration) return { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };

    try {
      const message: TransactionalEmail = type === LeadEmailTaskType.INTERNAL_NOTIFICATION
        ? { from: configuration.fromEmail, to: configuration.notificationTo, replyTo: lead.email, ...createInternalLeadNotificationTemplate(lead) }
        : { from: configuration.fromEmail, to: lead.email, ...createVisitorConfirmationTemplate(lead) };
      return await this.delivery.send(message, { idempotencyKey });
    } catch (error) {
      return {
        accepted: false,
        category: error instanceof LeadEmailAssetError ? "EMAIL_PROVIDER_REJECTED" : "EMAIL_PROVIDER_REJECTED",
      };
    }
  }
}
