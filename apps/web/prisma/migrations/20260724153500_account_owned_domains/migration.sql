ALTER TABLE "domains" ADD COLUMN IF NOT EXISTS "userId" TEXT;

UPDATE "domains" AS domain
SET "userId" = project."ownerId"
FROM "projects" AS project
WHERE domain."projectId" = project."id";

ALTER TABLE "domains" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "domains" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "domain_orders" ALTER COLUMN "projectId" DROP NOT NULL;

ALTER TABLE "domains" DROP CONSTRAINT IF EXISTS "domains_userId_fkey";
ALTER TABLE "domains" DROP CONSTRAINT IF EXISTS "domains_projectId_fkey";
ALTER TABLE "domain_orders" DROP CONSTRAINT IF EXISTS "domain_orders_projectId_fkey";

ALTER TABLE "domains"
ADD CONSTRAINT "domains_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "domains"
ADD CONSTRAINT "domains_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "domain_orders"
ADD CONSTRAINT "domain_orders_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "domains_userId_createdAt_idx"
ON "domains"("userId", "createdAt");
