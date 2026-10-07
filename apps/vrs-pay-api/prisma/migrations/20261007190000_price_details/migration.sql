-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "currency_options" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "lookup_key" TEXT,
ADD COLUMN     "nickname" TEXT;

-- AlterTable: a subscription remembers its currency, filled from its price.
ALTER TABLE "subscriptions" ADD COLUMN     "currency" CHAR(3);
UPDATE "subscriptions" AS s SET "currency" = p."currency" FROM "prices" AS p WHERE p."id" = s."price_id";
ALTER TABLE "subscriptions" ALTER COLUMN "currency" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "prices_merchant_id_mode_lookup_key_key" ON "prices"("merchant_id", "mode", "lookup_key");
