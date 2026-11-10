import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";

import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { PublicLeadRateLimiterService } from "./public-lead-rate-limiter.service";
import { PublicLeadSourceSiteResolver } from "./public-lead-source-site.resolver";
import {
  type PublicLeadSubmissionResponse,
  PublicLeadsService,
} from "./public-leads.service";
import { getPublicClientIp } from "../http/public-client-ip";

type ClientRequest = {
  ip?: unknown;
  correlationId?: string;
};

const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;

type HeaderResponse = {
  setHeader(name: string, value: string): unknown;
};

@Controller("public/leads")
export class PublicLeadsController {
  constructor(
    private readonly publicLeadsService: PublicLeadsService,
    private readonly rateLimiter: PublicLeadRateLimiterService,
    private readonly sourceSiteResolver: PublicLeadSourceSiteResolver,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() lead: CreatePublicLeadDto,
    @Req() request: ClientRequest,
    @Res({ passthrough: true }) response: HeaderResponse,
    @Headers("idempotency-key") idempotencyKey: string | undefined = undefined,
    @Headers("origin") origin: string | undefined = undefined,
  ): Promise<PublicLeadSubmissionResponse> {
    // Express trusts no proxy headers unless the deployment explicitly sets the
    // restricted TRUST_PROXY=loopback configuration.
    if (lead.website) {
      return { success: true, leadId: null };
    }

    const sourceSite = this.sourceSiteResolver.resolve(origin, lead.sourceSite);
    const resolvedLead = { ...lead, sourceSite };

    if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) {
      throw new BadRequestException("A valid Idempotency-Key header is required.");
    }

    const replay = await this.publicLeadsService.replayIfKnown(resolvedLead, idempotencyKey, request.correlationId ?? "unknown");
    if (replay) return replay;

    const rateLimit = this.rateLimiter.consume(getPublicClientIp(request.ip));
    if (!rateLimit.allowed) {
      response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: "Too many requests. Please try again later.",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return this.publicLeadsService.submit(
      resolvedLead,
      idempotencyKey,
      request.correlationId ?? "unknown",
    );
  }
}
