-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "payout_day" CHAR(10) NOT NULL,
    "rail" "Provider" NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "amount" BIGINT NOT NULL,
    "fee" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL,
    "bank_name" TEXT,
    "last4" TEXT,
    "failure_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payouts_merchant_id_mode_created_at_idx" ON "payouts"("merchant_id", "mode", "created_at" DESC);

-- CreateIndex
CREATE INDEX "payouts_status_created_at_idx" ON "payouts"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_merchant_id_mode_currency_payout_day_key" ON "payouts"("merchant_id", "mode", "currency", "payout_day");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_rail_provider_reference_key" ON "payouts"("rail", "provider_reference");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the new table out of the Supabase Data API (see the init migration).
ALTER TABLE "payouts" ENABLE ROW LEVEL SECURITY;
