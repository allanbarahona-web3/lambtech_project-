import { type DynamicModule, Module } from "@nestjs/common";
import { LeadSourceSite } from "@prisma/client";
import { PrismaModule } from "../prisma/prisma.module";
import {
  PUBLIC_LEAD_SOURCE_SITE_ORIGINS,
  PublicLeadSourceSiteResolver,
} from "../public-leads/public-lead-source-site.resolver";
import { PrivacyRequestRateLimiterService } from "./privacy-request-rate-limiter.service";
import { PrivacyRequestsController } from "./privacy-requests.controller";
import { PrivacyRequestsService } from "./privacy-requests.service";

@Module({})
export class PrivacyRequestsModule {
  static register(sourceSiteOrigins: ReadonlyMap<string, LeadSourceSite>): DynamicModule {
    return {
      module: PrivacyRequestsModule,
      imports: [PrismaModule],
      controllers: [PrivacyRequestsController],
      providers: [
        PrivacyRequestsService,
        PrivacyRequestRateLimiterService,
        PublicLeadSourceSiteResolver,
        { provide: PUBLIC_LEAD_SOURCE_SITE_ORIGINS, useValue: sourceSiteOrigins },
      ],
    };
  }
}
