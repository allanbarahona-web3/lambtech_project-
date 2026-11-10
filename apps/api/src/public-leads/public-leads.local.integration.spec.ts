import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  LeadInterest,
  LeadLocale,
  LeadSourceSite,
  PrismaClient,
} from "@prisma/client";
import { ConflictException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreatePublicLeadDto } from "./dto/create-public-lead.dto";
import { PublicLeadsService } from "./public-leads.service";

function localDiagnosticDatabaseUrl(variable: "DATABASE_URL" | "MIGRATION_DATABASE_URL"): string | undefined {
  if (process.env.PUBLIC_LEAD_LOCAL_INTEGRATION !== "1") {
    return undefined;
  }

  const configured = process.env[variable] ?? readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .find((line) => line.startsWith(`${variable}=`))
    ?.slice(`${variable}=`.length)
    .trim();
  if (!configured) {
    return undefined;
  }

  const value = configured.replace(/^(["'])|(["'])$/g, "");
  const url = new URL(value);
  return url.protocol === "postgresql:"
    && url.hostname === "127.0.0.1"
    && url.port === "5432"
    && url.pathname === "/barmentech_dev"
    ? value
    : undefined;
}

const databaseUrl = localDiagnosticDatabaseUrl("DATABASE_URL");
const migrationDatabaseUrl = localDiagnosticDatabaseUrl("MIGRATION_DATABASE_URL");

function diagnosticLead(
  email: string,
  sourceSite: LeadSourceSite,
): CreatePublicLeadDto {
  return {
    fullName: "Local diagnostic",
    email,
    country: "Costa Rica",
    interest: sourceSite === LeadSourceSite.TECHNOLOGY
      ? LeadInterest.TECHNOLOGY_AND_DIGITAL
      : LeadInterest.COMPANY_FORMATION,
    locale: LeadLocale.EN,
    message: "Local diagnostic lead submission only.",
    privacyAccepted: true,
    sourceSite,
  };
}

test("local runtime role persists public leads and the durable outbox", { skip: !databaseUrl || !migrationDatabaseUrl }, async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const cleanupPrisma = new PrismaClient({ datasources: { db: { url: migrationDatabaseUrl } } });
  const marker = randomUUID();
  const technologyEmail = `lead-diagnostic-technology-${marker}@example.invalid`;
  const formationEmail = `lead-diagnostic-formation-${marker}@example.invalid`;
  const technologyKey = `local-diagnostic-technology-${marker}`;
  const formationKey = `local-diagnostic-formation-${marker}`;
  const emails = [technologyEmail, formationEmail];

  await prisma.$connect();
  await cleanupPrisma.$connect();
  try {
    const service = new PublicLeadsService(prisma as unknown as PrismaService);
    const technology = diagnosticLead(technologyEmail, LeadSourceSite.TECHNOLOGY);

    assert.deepEqual(
      await service.submit(technology, technologyKey, "local-diagnostic"),
      { success: true, leadId: null },
    );
    assert.equal(await prisma.lead.count({ where: { email: technologyEmail } }), 1);
    assert.equal(await prisma.leadSubmission.count({ where: { idempotencyKey: technologyKey } }), 1);
    assert.equal(await prisma.leadEmailTask.count({ where: { lead: { email: technologyEmail } } }), 2);

    assert.deepEqual(
      await service.submit(technology, technologyKey, "local-diagnostic-replay"),
      { success: true, leadId: null },
    );
    assert.equal(await prisma.lead.count({ where: { email: technologyEmail } }), 1);
    assert.equal(await prisma.leadEmailTask.count({ where: { lead: { email: technologyEmail } } }), 2);
    await assert.rejects(
      () => service.submit({ ...technology, message: "A different diagnostic submission." }, technologyKey, "local-diagnostic-conflict"),
      ConflictException,
    );

    const formation = diagnosticLead(formationEmail, LeadSourceSite.FORMATION);
    assert.deepEqual(
      await service.submit(formation, formationKey, "local-diagnostic-formation"),
      { success: true, leadId: null },
    );
    assert.equal(await prisma.lead.count({ where: { email: formationEmail } }), 1);
    assert.equal(await prisma.leadSubmission.count({ where: { idempotencyKey: formationKey } }), 1);
    assert.equal(await prisma.leadEmailTask.count({ where: { lead: { email: formationEmail } } }), 2);
  } finally {
    await cleanupPrisma.leadEmailTask.deleteMany({ where: { lead: { email: { in: emails } } } });
    await cleanupPrisma.leadSubmission.deleteMany({ where: { lead: { email: { in: emails } } } });
    await cleanupPrisma.lead.deleteMany({ where: { email: { in: emails } } });
    await prisma.$disconnect();
    await cleanupPrisma.$disconnect();
  }
});
