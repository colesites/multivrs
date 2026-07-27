CREATE TABLE "saved_domains" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "price" DOUBLE PRECISION,
  "renewalPrice" DOUBLE PRECISION,
  "currency" TEXT NOT NULL,
  "premium" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saved_domains_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "saved_domains_userId_createdAt_idx"
  ON "saved_domains"("userId", "createdAt");
CREATE UNIQUE INDEX "saved_domains_userId_hostname_key"
  ON "saved_domains"("userId", "hostname");

ALTER TABLE "saved_domains" ADD CONSTRAINT "saved_domains_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
