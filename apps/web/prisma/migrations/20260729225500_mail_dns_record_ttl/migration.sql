ALTER TABLE "mail_dns_records"
ADD COLUMN "ttl" TEXT NOT NULL DEFAULT 'Auto';
