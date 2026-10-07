-- CreateEnum
CREATE TYPE "ProductSource" AS ENUM ('config', 'dashboard');

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "source" "ProductSource" NOT NULL DEFAULT 'config';

