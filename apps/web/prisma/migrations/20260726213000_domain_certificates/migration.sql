ALTER TABLE "domains"
  ADD COLUMN "edgeHostnameId" TEXT,
  ADD COLUMN "certVerificationName" TEXT,
  ADD COLUMN "certVerificationValue" TEXT;

CREATE UNIQUE INDEX "domains_edgeHostnameId_key" ON "domains"("edgeHostnameId");
