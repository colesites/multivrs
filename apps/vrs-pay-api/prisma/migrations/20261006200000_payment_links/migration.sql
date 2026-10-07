-- AlterTable
ALTER TABLE "checkout_sessions" ADD COLUMN     "payment_link_id" TEXT;

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "description" TEXT NOT NULL,
    "after_payment_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_links_merchant_id_mode_created_at_idx" ON "payment_links"("merchant_id", "mode", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Keep the new table out of the Supabase Data API (see the init migration).
ALTER TABLE "payment_links" ENABLE ROW LEVEL SECURITY;
