-- Durable privacy-request idempotency and email outbox tasks.
CREATE TYPE "privacy_request_email_task_type" AS ENUM ('INTERNAL_NOTIFICATION', 'VISITOR_CONFIRMATION');

CREATE TABLE "privacy_request_submissions" (
  "id" UUID NOT NULL,
  "idempotency_key" VARCHAR(128) NOT NULL,
  "content_hash" CHAR(64) NOT NULL,
  "privacy_request_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "privacy_request_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "privacy_request_submissions_idempotency_key_key"
  ON "privacy_request_submissions"("idempotency_key");
CREATE UNIQUE INDEX "privacy_request_submissions_privacy_request_id_key"
  ON "privacy_request_submissions"("privacy_request_id");
ALTER TABLE "privacy_request_submissions"
  ADD CONSTRAINT "privacy_request_submissions_privacy_request_id_fkey"
  FOREIGN KEY ("privacy_request_id") REFERENCES "privacy_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "privacy_request_email_tasks" (
  "id" UUID NOT NULL,
  "privacy_request_id" UUID NOT NULL,
  "type" "privacy_request_email_task_type" NOT NULL,
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
  CONSTRAINT "privacy_request_email_tasks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "privacy_request_email_tasks_privacy_request_id_type_key"
  ON "privacy_request_email_tasks"("privacy_request_id", "type");
CREATE INDEX "privacy_request_email_tasks_status_available_at_idx"
  ON "privacy_request_email_tasks"("status", "available_at");
CREATE INDEX "privacy_request_email_tasks_status_lease_expires_at_idx"
  ON "privacy_request_email_tasks"("status", "lease_expires_at");
ALTER TABLE "privacy_request_email_tasks"
  ADD CONSTRAINT "privacy_request_email_tasks_privacy_request_id_fkey"
  FOREIGN KEY ("privacy_request_id") REFERENCES "privacy_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
