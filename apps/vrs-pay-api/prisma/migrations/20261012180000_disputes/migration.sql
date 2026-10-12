-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'won', 'lost');

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "payment_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "amount" BIGINT NOT NULL,
    "amount_withdrawn" BIGINT NOT NULL DEFAULT 0,
    "fee" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL,
    "reason" TEXT,
    "evidence_due_by" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disputes_merchant_id_mode_created_at_idx" ON "disputes"("merchant_id", "mode", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "disputes_provider_provider_reference_key" ON "disputes"("provider", "provider_reference");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Keep the new table out of the Supabase Data API (see the init migration).
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
