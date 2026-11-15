-- Convert the inherited Barmentech intake taxonomy to the single LAMBTECH
-- website. Existing records are retained and mapped to their closest meaning.
ALTER TYPE "lead_source_site" RENAME TO "lead_source_site_legacy";
CREATE TYPE "lead_source_site" AS ENUM ('LAMBTECH');
ALTER TABLE "leads"
  ALTER COLUMN "source_site" TYPE "lead_source_site"
  USING 'LAMBTECH'::"lead_source_site";
DROP TYPE "lead_source_site_legacy";

ALTER TYPE "lead_interest" RENAME TO "lead_interest_legacy";
CREATE TYPE "lead_interest" AS ENUM (
  'MANUFACTURER_INQUIRY',
  'TECHNOLOGY_SOURCING',
  'GENERAL_INQUIRY'
);
ALTER TABLE "leads"
  ALTER COLUMN "interest" TYPE "lead_interest"
  USING (
    CASE "interest"::text
      WHEN 'TECHNOLOGY_AND_DIGITAL' THEN 'TECHNOLOGY_SOURCING'
      WHEN 'COMPANY_FORMATION' THEN 'MANUFACTURER_INQUIRY'
      ELSE 'GENERAL_INQUIRY'
    END
  )::"lead_interest";
DROP TYPE "lead_interest_legacy";

ALTER TABLE "leads"
  ALTER COLUMN "country" DROP NOT NULL,
  ADD COLUMN "company_website" VARCHAR(2048),
  ADD COLUMN "technology_context" VARCHAR(1000),
  ADD COLUMN "market_or_project" VARCHAR(1000);
