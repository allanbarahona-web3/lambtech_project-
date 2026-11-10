import { Inject, Injectable } from "@nestjs/common";
import { Resend, type Attachment } from "resend";

import {
  type LeadEmailConfiguration,
  LEAD_EMAIL_CONFIGURATION,
} from "./lead-email-configuration";

export type TransactionalEmail = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
};

export type EmailDeliveryOptions = {
  idempotencyKey?: string;
};

export type EmailDeliveryResult =
  | { accepted: true }
  | {
      accepted: false;
      category: "EMAIL_PROVIDER_REJECTED";
      providerErrorName?: string;
      providerStatusCode?: number;
    };

export interface EmailDeliveryService {
  send(message: TransactionalEmail, options?: EmailDeliveryOptions): Promise<EmailDeliveryResult>;
}

export const EMAIL_DELIVERY_SERVICE = Symbol("EMAIL_DELIVERY_SERVICE");

@Injectable()
export class ResendEmailDeliveryService implements EmailDeliveryService {
  private readonly resend: Resend | undefined;

  constructor(
    @Inject(LEAD_EMAIL_CONFIGURATION)
    configuration: LeadEmailConfiguration | null,
  ) {
    this.resend = configuration ? new Resend(configuration.apiKey) : undefined;
  }

  async send(message: TransactionalEmail, options?: EmailDeliveryOptions): Promise<EmailDeliveryResult> {
    if (!this.resend) {
      return { accepted: false, category: "EMAIL_PROVIDER_REJECTED" };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message.replyTo,
        attachments: message.attachments,
      }, options?.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined);

      if (data && !error) {
        return { accepted: true };
      }

      return providerRejection(error);
    } catch (error) {
      return providerRejection(error);
    }
  }
}

function providerRejection(error: unknown): Extract<
  EmailDeliveryResult,
  { accepted: false }
> {
  const candidate =
    error && typeof error === "object"
      ? (error as { name?: unknown; statusCode?: unknown })
      : undefined;
  const providerErrorName =
    typeof candidate?.name === "string" &&
    /^[A-Za-z0-9_.-]{1,80}$/.test(candidate.name)
      ? candidate.name
      : undefined;
  const providerStatusCode =
    typeof candidate?.statusCode === "number" &&
    Number.isInteger(candidate.statusCode) &&
    candidate.statusCode >= 100 &&
    candidate.statusCode <= 599
      ? candidate.statusCode
      : undefined;

  return {
    accepted: false,
    category: "EMAIL_PROVIDER_REJECTED",
    ...(providerErrorName ? { providerErrorName } : {}),
    ...(providerStatusCode ? { providerStatusCode } : {}),
  };
}
