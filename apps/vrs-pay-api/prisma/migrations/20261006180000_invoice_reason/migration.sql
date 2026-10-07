-- CreateEnum
CREATE TYPE "InvoiceReason" AS ENUM ('subscription_create', 'subscription_cycle', 'subscription_update');

-- DropIndex
DROP INDEX "invoices_subscription_id_period_start_key";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "billing_reason" "InvoiceReason" NOT NULL DEFAULT 'subscription_cycle';

-- CreateIndex
CREATE UNIQUE INDEX "invoices_subscription_id_period_start_billing_reason_key" ON "invoices"("subscription_id", "period_start", "billing_reason");

