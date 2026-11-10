import { BadRequestException, Body, Controller, Headers, HttpCode, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { getPublicClientIp } from "../http/public-client-ip";
import { CreatePrivacyRequestDto } from "./dto/create-privacy-request.dto";
import { PrivacyRequestRateLimiterService } from "./privacy-request-rate-limiter.service";
import { PrivacyRequestsService } from "./privacy-requests.service";

@Controller("public/privacy-requests")
export class PrivacyRequestsController {
  constructor(private readonly service: PrivacyRequestsService, private readonly limiter: PrivacyRequestRateLimiterService) {}
  @Post() @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreatePrivacyRequestDto, @Req() request: { ip?: unknown }, @Res({ passthrough: true }) response: { setHeader(name: string, value: string): unknown }, @Headers("idempotency-key") idempotencyKey: string | undefined = undefined) {
    if (body.website) {
      return { success: true as const, requestId: null };
    }

    const result = this.limiter.consume(getPublicClientIp(request.ip));
    if (!result.allowed) { response.setHeader("Retry-After", String(result.retryAfterSeconds)); throw new HttpException({ statusCode: HttpStatus.TOO_MANY_REQUESTS, error: "Too many requests. Please try again later." }, HttpStatus.TOO_MANY_REQUESTS); }
    if (idempotencyKey && !/^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/.test(idempotencyKey)) {
      throw new BadRequestException("A valid Idempotency-Key header is required when provided.");
    }
    return this.service.submit(body, idempotencyKey);
  }
}
