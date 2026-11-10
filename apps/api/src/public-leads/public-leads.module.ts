import { type DynamicModule, Module } from "@nestjs/common";
import { LeadSourceSite } from "@prisma/client";

import { PrismaModule } from "../prisma/prisma.module";
import { PublicLeadRateLimiterService } from "./public-lead-rate-limiter.service";
import { PublicLeadsController } from "./public-leads.controller";
import { PublicLeadsService } from "./public-leads.service";
import {
  PUBLIC_LEAD_SOURCE_SITE_ORIGINS,
  PublicLeadSourceSiteResolver,
} from "./public-lead-source-site.resolver";

@Module({})
export class PublicLeadsModule {
  static register(sourceSiteOrigins: ReadonlyMap<string, LeadSourceSite>): DynamicModule {
    return {
      module: PublicLeadsModule,
      imports: [PrismaModule],
      controllers: [PublicLeadsController],
      providers: [
        PublicLeadsService,
        PublicLeadRateLimiterService,
        PublicLeadSourceSiteResolver,
        { provide: PUBLIC_LEAD_SOURCE_SITE_ORIGINS, useValue: sourceSiteOrigins },
      ],
    };
  }
}
