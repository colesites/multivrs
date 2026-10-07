-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('licensed', 'metered');

-- CreateEnum
CREATE TYPE "AggregateUsage" AS ENUM ('sum', 'max', 'last');

-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "aggregate_usage" "AggregateUsage",
ADD COLUMN     "usage_type" "UsageType" NOT NULL DEFAULT 'licensed';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "usage_from" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "usage_records" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usage_records_subscription_id_timestamp_idx" ON "usage_records"("subscription_id", "timestamp");

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_records" ADD CONSTRAINT "usage_records_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

