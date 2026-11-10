import { type DynamicModule, Module } from "@nestjs/common";

import type { ApiConfiguration } from "./config/api-configuration";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PublicLeadsModule } from "./public-leads/public-leads.module";
import { PrivacyRequestsModule } from "./privacy-requests/privacy-requests.module";

@Module({})
export class AppModule {
  static register(configuration: ApiConfiguration): DynamicModule {
    return {
      module: AppModule,
      imports: [
        HealthModule,
        PrismaModule,
        PublicLeadsModule.register(configuration.publicLeadSourceSiteOrigins),
        PrivacyRequestsModule,
      ],
    };
  }
}
