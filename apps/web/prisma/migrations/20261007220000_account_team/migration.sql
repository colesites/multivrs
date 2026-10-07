-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "accountOwnerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_accountOwnerId_key" ON "organizations"("accountOwnerId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

