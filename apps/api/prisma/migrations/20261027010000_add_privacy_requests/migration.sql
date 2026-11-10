CREATE TYPE "privacy_request_type" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'WITHDRAW_CONSENT', 'INFORMATION', 'OTHER');
CREATE TYPE "privacy_request_status" AS ENUM ('RECEIVED', 'IDENTITY_VERIFICATION_REQUIRED', 'IN_REVIEW', 'COMPLETED', 'DECLINED', 'CLOSED');

CREATE TABLE "privacy_requests" (
  "id" UUID NOT NULL,
  "locale" "lead_locale" NOT NULL,
  "request_type" "privacy_request_type" NOT NULL,
  "status" "privacy_request_status" NOT NULL DEFAULT 'RECEIVED',
  "email" VARCHAR(320) NOT NULL,
  "message" VARCHAR(1000),
  "privacy_notice_accepted_at" TIMESTAMPTZ(3) NOT NULL,
  "internal_notification_status" "email_delivery_status" NOT NULL DEFAULT 'PENDING',
  "visitor_confirmation_status" "email_delivery_status" NOT NULL DEFAULT 'PENDING',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "privacy_requests_status_created_at_idx" ON "privacy_requests"("status", "created_at");
CREATE INDEX "privacy_requests_request_type_created_at_idx" ON "privacy_requests"("request_type", "created_at");
CREATE INDEX "privacy_requests_email_idx" ON "privacy_requests"("email");
CREATE INDEX "privacy_requests_created_at_idx" ON "privacy_requests"("created_at");
