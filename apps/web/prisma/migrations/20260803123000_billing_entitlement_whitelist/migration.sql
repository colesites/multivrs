CREATE TABLE "billing_entitlement_whitelist" (
  "email" VARCHAR(320) NOT NULL,
  "reason" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "billing_entitlement_whitelist_pkey" PRIMARY KEY ("email"),
  CONSTRAINT "billing_entitlement_whitelist_normalized_email_check"
    CHECK ("email" = LOWER(BTRIM("email")))
);

CREATE INDEX "billing_entitlement_whitelist_enabled_idx"
ON "billing_entitlement_whitelist"("enabled");

INSERT INTO "billing_entitlement_whitelist"
  ("email", "reason", "enabled", "createdAt", "updatedAt")
VALUES
  (
    'colecrownwealthadrian@gmail.com',
    'Founding account billing-limit exception',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'aderibigbeadedamolajohn@gmail.com',
    'Founding account billing-limit exception',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
