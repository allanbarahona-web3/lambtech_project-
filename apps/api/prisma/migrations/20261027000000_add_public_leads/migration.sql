-- CreateEnum
CREATE TYPE "lead_source_site" AS ENUM ('FORMATION', 'TECHNOLOGY');

-- CreateEnum
CREATE TYPE "lead_locale" AS ENUM ('EN', 'ES');

-- CreateEnum
CREATE TYPE "lead_interest" AS ENUM (
  'COMPANY_FORMATION',
  'TAX_SERVICES',
  'ANNUAL_COMPLIANCE',
  'BANKING_AND_PAYMENTS',
  'TECHNOLOGY_AND_DIGITAL',
  'IN_PERSON_WORKSHOP',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "email_delivery_status" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "leads" (
  "id" UUID NOT NULL,
  "source_site" "lead_source_site" NOT NULL,
  "locale" "lead_locale" NOT NULL,
  "interest" "lead_interest" NOT NULL,
  "status" "lead_status" NOT NULL DEFAULT 'NEW',
  "full_name" VARCHAR(160) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "phone" VARCHAR(40),
  "country" VARCHAR(100) NOT NULL,
  "company" VARCHAR(160),
  "message" VARCHAR(2000) NOT NULL,
  "privacy_consent_at" TIMESTAMPTZ(3) NOT NULL,
  "campaign" VARCHAR(255),
  "utm_source" VARCHAR(255),
  "utm_medium" VARCHAR(255),
  "utm_campaign" VARCHAR(255),
  "internal_notification_status" "email_delivery_status" NOT NULL DEFAULT 'PENDING',
  "visitor_confirmation_status" "email_delivery_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,

  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_status_created_at_idx" ON "leads"("status", "created_at");

-- CreateIndex
CREATE INDEX "leads_source_site_created_at_idx" ON "leads"("source_site", "created_at");

-- CreateIndex
CREATE INDEX "leads_interest_created_at_idx" ON "leads"("interest", "created_at");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");
