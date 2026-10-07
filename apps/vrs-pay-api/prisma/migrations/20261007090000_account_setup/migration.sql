-- CreateEnum
CREATE TYPE "IdentityStatus" AS ENUM ('unverified', 'pending', 'verified', 'failed');

-- AlterTable
ALTER TABLE "merchant_onboarding" ADD COLUMN     "id_last4" TEXT,
ADD COLUMN     "id_number" TEXT,
ADD COLUMN     "id_type" TEXT,
ADD COLUMN     "identity_checked_at" TIMESTAMP(3),
ADD COLUMN     "identity_reason" TEXT,
ADD COLUMN     "identity_status" "IdentityStatus" NOT NULL DEFAULT 'unverified',
ADD COLUMN     "support_email" TEXT;

