import { ConflictException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { EmailDeliveryStatus, LeadEmailTaskType, LeadStatus, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";

import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";

export type PublicLeadSubmissionResponse = { success: true; leadId: null };

function hashLead(lead: CreatePublicLeadDto): string {
  return createHash("sha256").update(JSON.stringify({ campaign: lead.campaign ?? null, company: lead.company ?? null, country: lead.country, email: lead.email, fullName: lead.fullName, interest: lead.interest, locale: lead.locale, message: lead.message, phone: lead.phone ?? null, privacyAccepted: lead.privacyAccepted, sourceSite: lead.sourceSite })).digest("hex");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

@Injectable()
export class PublicLeadsService {
  private readonly logger = new Logger(PublicLeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async replayIfKnown(lead: CreatePublicLeadDto, idempotencyKey: string, correlationId: string): Promise<PublicLeadSubmissionResponse | undefined> {
    let existing: { contentHash: string } | null;
    try {
      existing = await this.prisma.leadSubmission.findUnique({ where: { idempotencyKey }, select: { contentHash: true } });
    } catch (error) {
      this.logPersistenceFailure(correlationId, "leadSubmission.findUnique", error);
      throw error;
    }
    return existing ? this.replay(existing.contentHash, hashLead(lead), correlationId) : undefined;
  }

  async submit(
    lead: CreatePublicLeadDto, idempotencyKey = "legacy-test-idempotency-key", correlationId = "legacy-test",
  ): Promise<PublicLeadSubmissionResponse> {
    if (lead.website) {
      return { success: true, leadId: null };
    }

    const contentHash = hashLead(lead);
    const replay = await this.replayIfKnown(lead, idempotencyKey, correlationId);
    if (replay) return replay;
    try {
      await this.prisma.$transaction((transaction) => transaction.leadSubmission.create({
        data: {
          idempotencyKey, contentHash,
          lead: { create: {
            sourceSite: lead.sourceSite, locale: lead.locale, interest: lead.interest, status: LeadStatus.NEW,
            fullName: lead.fullName, email: lead.email, phone: lead.phone ?? null, country: lead.country,
            company: lead.company ?? null, message: lead.message, privacyConsentAt: new Date(), campaign: lead.campaign ?? null,
            internalNotificationStatus: EmailDeliveryStatus.PENDING, visitorConfirmationStatus: EmailDeliveryStatus.PENDING,
            emailTasks: { create: [{ type: LeadEmailTaskType.INTERNAL_NOTIFICATION }, { type: LeadEmailTaskType.VISITOR_CONFIRMATION }] },
          } },
        },
      }));
      this.log(correlationId, "lead_submission_committed");
      return { success: true, leadId: null };
    } catch (error) {
      if (isUniqueViolation(error)) {
        const replay = await this.prisma.leadSubmission.findUnique({ where: { idempotencyKey }, select: { contentHash: true } });
        if (replay) return this.replay(replay.contentHash, contentHash, correlationId);
      }
      this.logPersistenceFailure(correlationId, "leadSubmission.create", error);
      throw new InternalServerErrorException(
        "Unable to process your submission.",
      );
    }
  }

  private replay(storedHash: string, contentHash: string, correlationId: string): PublicLeadSubmissionResponse {
    if (storedHash !== contentHash) throw new ConflictException("Idempotency key cannot be reused for different content.");
    this.log(correlationId, "lead_submission_replayed");
    return { success: true, leadId: null };
  }

  private log(correlationId: string, event: string): void {
    this.logger.log(JSON.stringify({ correlationId, event }));
  }

  private logPersistenceFailure(correlationId: string, operation: string, error: unknown): void {
    const errorClass = error instanceof Error && /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(error.name)
      ? error.name
      : "UnknownError";
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError
      && /^[A-Z][0-9]{4}$/.test(error.code)
      ? error.code
      : undefined;
    this.logger.error(JSON.stringify({
      correlationId,
      event: "lead_submission_persistence_failed",
      operation,
      errorClass,
      ...(prismaCode ? { prismaCode } : {}),
    }));
  }
}
