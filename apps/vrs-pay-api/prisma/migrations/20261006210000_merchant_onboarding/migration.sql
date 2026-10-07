-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('not_started', 'in_review', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('individual', 'company');

-- CreateTable
CREATE TABLE "merchant_onboarding" (
    "merchant_id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'not_started',
    "business_type" "BusinessType",
    "business_name" TEXT,
    "country" CHAR(2),
    "website" TEXT,
    "product_description" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "date_of_birth" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "phone" TEXT,
    "payout_currency" CHAR(3),
    "payout_account_name" TEXT,
    "payout_bank_name" TEXT,
    "payout_details" TEXT,
    "payout_last4" TEXT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchant_onboarding_pkey" PRIMARY KEY ("merchant_id")
);

-- AddForeignKey
ALTER TABLE "merchant_onboarding" ADD CONSTRAINT "merchant_onboarding_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep the new table out of the Supabase Data API (see the init migration).
ALTER TABLE "merchant_onboarding" ENABLE ROW LEVEL SECURITY;

-- Platform-account pricing: new default fee is 5% (plus a fixed part per currency, applied in code).
ALTER TABLE "merchants" ALTER COLUMN "platform_fee_bps" SET DEFAULT 500;
