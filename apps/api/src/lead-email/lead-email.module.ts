import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import {
  EMAIL_DELIVERY_SERVICE,
  ResendEmailDeliveryService,
} from "./email-delivery.service";
import {
  getLeadEmailConfiguration,
  type LeadEmailConfiguration,
  LEAD_EMAIL_CONFIGURATION,
} from "./lead-email-configuration";
import { LeadNotificationsService } from "./lead-notifications.service";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: LEAD_EMAIL_CONFIGURATION,
      useFactory: (): LeadEmailConfiguration | null =>
        getLeadEmailConfiguration(),
    },
    ResendEmailDeliveryService,
    {
      provide: EMAIL_DELIVERY_SERVICE,
      useExisting: ResendEmailDeliveryService,
    },
    LeadNotificationsService,
  ],
  exports: [
    LeadNotificationsService,
    EMAIL_DELIVERY_SERVICE,
    LEAD_EMAIL_CONFIGURATION,
  ],
})
export class LeadEmailModule {}
