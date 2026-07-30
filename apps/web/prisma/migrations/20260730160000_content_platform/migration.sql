-- CreateTable
CREATE TABLE "project_content_settings" (
    "projectId" TEXT NOT NULL,
    "routingVersion" TEXT NOT NULL,
    "edgeConfigVersion" TEXT NOT NULL,
    "cacheVersion" TEXT NOT NULL,
    "defaultRevalidate" INTEGER NOT NULL DEFAULT 3600,
    "staleWindow" INTEGER NOT NULL DEFAULT 86400,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_content_settings_pkey" PRIMARY KEY ("projectId")
);

CREATE TABLE "project_blobs" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pathname" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" BIGINT NOT NULL DEFAULT 0,
    "checksum" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_blobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bulk_redirects" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 308,
    "preserveQuery" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bulk_redirects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "edge_config_entries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "edge_config_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_cache_tags" (
    "projectId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_cache_tags_pkey" PRIMARY KEY ("projectId","tag")
);

CREATE TABLE "microfrontend_routes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "targetProjectId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "stripPrefix" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "microfrontend_routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "usage_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "metric" TEXT NOT NULL,
    "quantity" BIGINT NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_blobs_storageKey_key" ON "project_blobs"("storageKey");
CREATE UNIQUE INDEX "project_blobs_projectId_pathname_key" ON "project_blobs"("projectId", "pathname");
CREATE INDEX "project_blobs_projectId_status_createdAt_idx" ON "project_blobs"("projectId", "status", "createdAt");
CREATE UNIQUE INDEX "bulk_redirects_projectId_source_key" ON "bulk_redirects"("projectId", "source");
CREATE INDEX "bulk_redirects_projectId_enabled_priority_idx" ON "bulk_redirects"("projectId", "enabled", "priority");
CREATE UNIQUE INDEX "edge_config_entries_projectId_key_key" ON "edge_config_entries"("projectId", "key");
CREATE INDEX "edge_config_entries_projectId_updatedAt_idx" ON "edge_config_entries"("projectId", "updatedAt");
CREATE UNIQUE INDEX "microfrontend_routes_projectId_source_key" ON "microfrontend_routes"("projectId", "source");
CREATE INDEX "microfrontend_routes_projectId_enabled_priority_idx" ON "microfrontend_routes"("projectId", "enabled", "priority");
CREATE INDEX "microfrontend_routes_targetProjectId_idx" ON "microfrontend_routes"("targetProjectId");
CREATE INDEX "usage_events_userId_metric_occurredAt_idx" ON "usage_events"("userId", "metric", "occurredAt");
CREATE INDEX "usage_events_projectId_metric_occurredAt_idx" ON "usage_events"("projectId", "metric", "occurredAt");

ALTER TABLE "project_content_settings" ADD CONSTRAINT "project_content_settings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_blobs" ADD CONSTRAINT "project_blobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bulk_redirects" ADD CONSTRAINT "bulk_redirects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "edge_config_entries" ADD CONSTRAINT "edge_config_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_cache_tags" ADD CONSTRAINT "project_cache_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "microfrontend_routes" ADD CONSTRAINT "microfrontend_routes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "microfrontend_routes" ADD CONSTRAINT "microfrontend_routes_targetProjectId_fkey" FOREIGN KEY ("targetProjectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
