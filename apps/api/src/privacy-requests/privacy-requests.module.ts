import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { PrivacyRequestRateLimiterService } from "./privacy-request-rate-limiter.service";
import { PrivacyRequestsController } from "./privacy-requests.controller";
import { PrivacyRequestsService } from "./privacy-requests.service";
@Module({ imports: [PrismaModule], controllers: [PrivacyRequestsController], providers: [PrivacyRequestsService, PrivacyRequestRateLimiterService] })
export class PrivacyRequestsModule {}
