-- Durable public-lead submission idempotency and independently deliverable email tasks.
CREATE TYPE "lead_email_task_type" AS ENUM ('INTERNAL_NOTIFICATION', 'VISITOR_CONFIRMATION');
CREATE TYPE "lead_email_task_status" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

CREATE TABLE "lead_submissions" (
  "id" UUID NOT NULL,
  "idempotency_key" VARCHAR(128) NOT NULL,
  "content_hash" CHAR(64) NOT NULL,
  "lead_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_submissions_idempotency_key_key" ON "lead_submissions"("idempotency_key");
CREATE UNIQUE INDEX "lead_submissions_lead_id_key" ON "lead_submissions"("lead_id");
ALTER TABLE "lead_submissions" ADD CONSTRAINT "lead_submissions_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "lead_email_tasks" (
  "id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "type" "lead_email_task_type" NOT NULL,
  "status" "lead_email_task_status" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "available_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leased_at" TIMESTAMPTZ(3),
  "lease_expires_at" TIMESTAMPTZ(3),
  "lease_token" UUID,
  "completed_at" TIMESTAMPTZ(3),
  "last_error_code" VARCHAR(80),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "lead_email_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_email_tasks_lead_id_type_key" ON "lead_email_tasks"("lead_id", "type");
CREATE INDEX "lead_email_tasks_status_available_at_idx" ON "lead_email_tasks"("status", "available_at");
CREATE INDEX "lead_email_tasks_status_lease_expires_at_idx" ON "lead_email_tasks"("status", "lease_expires_at");
ALTER TABLE "lead_email_tasks" ADD CONSTRAINT "lead_email_tasks_lead_id_fkey"
  FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
