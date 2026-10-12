-- Key labels, publishable keys readable again, test secret keys revealable
-- (sealed), and when each key was last used.
ALTER TABLE "api_keys" ADD COLUMN "name" TEXT;
ALTER TABLE "api_keys" ADD COLUMN "plaintext" TEXT;
ALTER TABLE "api_keys" ADD COLUMN "sealed_secret" TEXT;
ALTER TABLE "api_keys" ADD COLUMN "last_used_at" TIMESTAMP(3);
