import { Module } from "@nestjs/common";

import { LeadEmailModule } from "./lead-email.module";
import { LeadEmailTaskDeliveryService } from "./lead-email-task-delivery.service";
import { LeadEmailWorkerService } from "./lead-email-worker.service";
import { PrismaModule } from "../prisma/prisma.module";
import { PrivacyRequestEmailTaskDeliveryService } from "../privacy-requests/privacy-request-email-task-delivery.service";

@Module({ imports: [PrismaModule, LeadEmailModule], providers: [LeadEmailTaskDeliveryService, PrivacyRequestEmailTaskDeliveryService, LeadEmailWorkerService] })
export class LeadEmailWorkerModule {}
