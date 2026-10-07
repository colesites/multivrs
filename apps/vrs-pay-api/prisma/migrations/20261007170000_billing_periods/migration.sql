-- AlterEnum
ALTER TYPE "PriceInterval" ADD VALUE 'day';
ALTER TYPE "PriceInterval" ADD VALUE 'week';

-- AlterTable
ALTER TABLE "payment_links" ADD COLUMN     "interval_count" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "interval_count" INTEGER NOT NULL DEFAULT 1;
