ALTER TABLE "domains"
  ADD COLUMN "managed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "autoRenew" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "providerDomainId" TEXT;

-- Account-owned, unconnected domains were created by the purchase flow.
UPDATE "domains"
SET
  "managed" = true,
  "autoRenew" = true,
  "expiresAt" = "createdAt" + INTERVAL '1 year'
WHERE "projectId" IS NULL;

UPDATE "domains" AS d
SET
  "managed" = true,
  "autoRenew" = true,
  "expiresAt" = COALESCE(d."expiresAt", d."createdAt" + INTERVAL '1 year'),
  "providerDomainId" = o."providerDomainId"
FROM "domain_orders" AS o
WHERE
  o."hostname" = d."hostname"
  AND o."status" = 'fulfilled';
