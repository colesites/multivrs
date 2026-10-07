-- AlterTable
ALTER TABLE "prices" ADD COLUMN     "source" "ProductSource" NOT NULL DEFAULT 'config';


-- Dashboard products may have several active prices per slot; config plans keep one.
UPDATE "prices" SET "source" = "plans"."source" FROM "plans" WHERE "prices"."plan_id" = "plans"."id";
DROP INDEX IF EXISTS "prices_one_active_per_slot";
CREATE UNIQUE INDEX "prices_one_active_per_slot" ON "prices" ("plan_id", "interval", "currency") WHERE "active" AND "source" = 'config';
