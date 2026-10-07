-- CreateEnum
CREATE TYPE "CheckoutMode" AS ENUM ('payment', 'subscription');

-- AlterTable
ALTER TABLE "checkout_sessions" ADD COLUMN     "checkout_mode" "CheckoutMode" NOT NULL DEFAULT 'payment',
ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "subscription_id" TEXT;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "subtotal" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "tax" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "pending_quantity" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

