-- AlterTable
ALTER TABLE "merchant_onboarding" ADD COLUMN     "identity_attempts" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[];
