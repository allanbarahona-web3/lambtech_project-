import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { EmailDeliveryStatus, Prisma, PrivacyRequestStatus, type PrivacyRequest } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePrivacyRequestDto } from "./dto/create-privacy-request.dto";
import type { PrivacyRequestEmailTaskType } from "./privacy-request-email-task-delivery.service";

type PrivacyRequestSubmission = { contentHash: string };
type PrivacyRequestTransaction = {
  privacyRequest: {
    create(args: { data: Record<string, unknown> }): Promise<PrivacyRequest>;
  };
};
type PrivacyOutboxPrisma = {
  privacyRequestSubmission: {
    findUnique(args: { where: { idempotencyKey: string }; select: { contentHash: true } }): Promise<PrivacyRequestSubmission | null>;
  };
  $transaction<T>(callback: (transaction: PrivacyRequestTransaction) => Promise<T>): Promise<T>;
};

export type PrivacyRequestSubmissionResponse = { success: true; requestId: null };

function hashPrivacyRequest(input: CreatePrivacyRequestDto): string {
  return createHash("sha256").update(JSON.stringify({
    email: input.email,
    locale: input.locale,
    message: input.message ?? null,
    privacyAccepted: input.privacyAccepted,
    requestType: input.requestType,
  })).digest("hex");
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

@Injectable()
export class PrivacyRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(input: CreatePrivacyRequestDto, idempotencyKey?: string): Promise<PrivacyRequestSubmissionResponse> {
    if (input.website) return { success: true, requestId: null };
    const client = this.prisma as unknown as PrivacyOutboxPrisma;
    const contentHash = hashPrivacyRequest(input);

    if (idempotencyKey) {
      const replay = await this.replayIfKnown(client, idempotencyKey, contentHash);
      if (replay) return replay;
    }

    try {
      await client.$transaction(async (transaction) => transaction.privacyRequest.create({
        data: {
          locale: input.locale,
          requestType: input.requestType,
          status: PrivacyRequestStatus.RECEIVED,
          email: input.email,
          message: input.message ?? null,
          privacyNoticeAcceptedAt: new Date(),
          internalNotificationStatus: EmailDeliveryStatus.PENDING,
          visitorConfirmationStatus: EmailDeliveryStatus.PENDING,
          emailTasks: {
            create: [
              { type: "INTERNAL_NOTIFICATION" satisfies PrivacyRequestEmailTaskType },
              { type: "VISITOR_CONFIRMATION" satisfies PrivacyRequestEmailTaskType },
            ],
          },
          ...(idempotencyKey ? {
            submission: { create: { idempotencyKey, contentHash } },
          } : {}),
        },
      }));
      return { success: true, requestId: null };
    } catch (error) {
      if (idempotencyKey && isUniqueViolation(error)) {
        const replay = await this.replayIfKnown(client, idempotencyKey, contentHash);
        if (replay) return replay;
      }
      throw new InternalServerErrorException("Unable to process your request.");
    }
  }

  private async replayIfKnown(
    client: PrivacyOutboxPrisma,
    idempotencyKey: string,
    contentHash: string,
  ): Promise<PrivacyRequestSubmissionResponse | undefined> {
    const existing = await client.privacyRequestSubmission.findUnique({
      where: { idempotencyKey },
      select: { contentHash: true },
    });
    if (!existing) return undefined;
    if (existing.contentHash !== contentHash) {
      throw new ConflictException("Idempotency key cannot be reused for different content.");
    }
    return { success: true, requestId: null };
  }
}
