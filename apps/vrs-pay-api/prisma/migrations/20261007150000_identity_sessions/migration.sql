-- AlterTable
ALTER TABLE "merchant_onboarding" ADD COLUMN     "identity_session_id" TEXT;

-- ID checks are automatic now. Results that were waiting on a manual review
-- (pending without a provider session) start over.
UPDATE "merchant_onboarding"
SET "identity_status" = 'unverified', "identity_reason" = NULL
WHERE "identity_status" = 'pending';
