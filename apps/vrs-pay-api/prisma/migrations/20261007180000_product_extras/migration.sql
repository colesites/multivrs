-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "marketing_features" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';
