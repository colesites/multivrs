-- Tax collected on payments and returned on refunds, in minor units.
ALTER TABLE "payments" ADD COLUMN "amount_tax" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "refunds" ADD COLUMN "amount_tax" BIGINT NOT NULL DEFAULT 0;
