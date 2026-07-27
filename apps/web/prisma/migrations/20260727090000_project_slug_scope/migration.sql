DROP INDEX IF EXISTS "public"."projects_slug_key";

CREATE UNIQUE INDEX "projects_ownerId_slug_key"
ON "public"."projects"("ownerId", "slug");
