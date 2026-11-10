import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  EmailDeliveryStatus,
  type Lead,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import {
  EMAIL_DELIVERY_SERVICE,
  type EmailDeliveryService,
  type EmailDeliveryResult,
  type TransactionalEmail,
} from "./email-delivery.service";
import {
  type LeadEmailConfiguration,
  LEAD_EMAIL_CONFIGURATION,
} from "./lead-email-configuration";
import {
  createInternalLeadNotificationTemplate,
  createVisitorConfirmationTemplate,
} from "./lead-email-templates";
import { LeadEmailAssetError } from "./lead-email-logo";

export type LeadNotificationRecord = Pick<
  Lead,
  | "id"
  | "sourceSite"
  | "locale"
  | "interest"
  | "fullName"
  | "email"
  | "phone"
  | "country"
  | "company"
  | "message"
  | "privacyConsentAt"
  | "campaign"
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "createdAt"
>;

type DeliveryStatusField =
  | "internalNotificationStatus"
  | "visitorConfirmationStatus";

type DeliveryType = "internal" | "visitor";
type EmailFailureCategory =
  | "EMAIL_ASSET_NOT_FOUND"
  | "EMAIL_ASSET_INVALID"
  | "EMAIL_TEMPLATE_FAILED"
  | "EMAIL_PROVIDER_REJECTED"
  | "EMAIL_STATUS_UPDATE_FAILED";

@Injectable()
export class LeadNotificationsService {
  private readonly logger = new Logger(LeadNotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_DELIVERY_SERVICE)
    private readonly emailDelivery: EmailDeliveryService,
    @Inject(LEAD_EMAIL_CONFIGURATION)
    private readonly configuration: LeadEmailConfiguration | null,
  ) {}

  async notify(lead: LeadNotificationRecord): Promise<void> {
    const configuration = this.configuration;
    if (!configuration) {
      await this.recordDeliveryStatus(
        lead.id,
        "internalNotificationStatus",
        EmailDeliveryStatus.FAILED,
        "internal",
      );
      await this.recordDeliveryStatus(
        lead.id,
        "visitorConfirmationStatus",
        EmailDeliveryStatus.FAILED,
        "visitor",
      );
      return;
    }

    await this.sendAndRecord(
      lead.id,
      "internal",
      "internalNotificationStatus",
      () => ({
        from: configuration.fromEmail,
        to: configuration.notificationTo,
        replyTo: lead.email,
        ...createInternalLeadNotificationTemplate(lead),
      }),
    );
    await this.sendAndRecord(
      lead.id,
      "visitor",
      "visitorConfirmationStatus",
      () => ({
        from: configuration.fromEmail,
        to: lead.email,
        ...createVisitorConfirmationTemplate(lead),
      }),
    );
  }

  private async sendAndRecord(
    leadId: string,
    deliveryType: DeliveryType,
    statusField: DeliveryStatusField,
    createMessage: () => TransactionalEmail,
  ): Promise<void> {
    let message: TransactionalEmail;
    try {
      message = createMessage();
    } catch (error) {
      const category =
        error instanceof LeadEmailAssetError
          ? error.category
          : "EMAIL_TEMPLATE_FAILED";
      this.logFailure(leadId, deliveryType, category);
      await this.recordDeliveryStatus(
        leadId,
        statusField,
        EmailDeliveryStatus.FAILED,
        deliveryType,
      );
      return;
    }

    let result: EmailDeliveryResult;
    try {
      result = await this.emailDelivery.send(message);
    } catch {
      result = { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };
    }

    if (!result.accepted) {
      this.logFailure(leadId, deliveryType, result.category, result);
    }
    await this.recordDeliveryStatus(
      leadId,
      statusField,
      result.accepted ? EmailDeliveryStatus.SENT : EmailDeliveryStatus.FAILED,
      deliveryType,
    );
  }

  private async recordDeliveryStatus(
    leadId: string,
    statusField: DeliveryStatusField,
    status: EmailDeliveryStatus,
    deliveryType: DeliveryType,
  ): Promise<void> {
    try {
      if (statusField === "internalNotificationStatus") {
        await this.prisma.lead.update({
          where: { id: leadId },
          data: { internalNotificationStatus: status },
        });
        return;
      }

      await this.prisma.lead.update({
        where: { id: leadId },
        data: { visitorConfirmationStatus: status },
      });
    } catch {
      this.logFailure(leadId, deliveryType, "EMAIL_STATUS_UPDATE_FAILED");
    }
  }

  private logFailure(
    leadId: string,
    deliveryType: DeliveryType,
    category: EmailFailureCategory,
    provider?: Extract<EmailDeliveryResult, { accepted: false }>,
  ): void {
    this.logger.warn(
      JSON.stringify({
        leadId,
        deliveryType,
        category,
        ...(provider?.providerStatusCode
          ? { providerStatusCode: provider.providerStatusCode }
          : {}),
        ...(provider?.providerErrorName
          ? { providerErrorName: provider.providerErrorName }
          : {}),
      }),
    );
  }
}
