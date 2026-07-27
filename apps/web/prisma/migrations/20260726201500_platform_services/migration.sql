CREATE TABLE "project_edge_settings" (
  "projectId" TEXT NOT NULL,
  "cacheMode" TEXT NOT NULL DEFAULT 'smart',
  "browserTtl" INTEGER NOT NULL DEFAULT 0,
  "edgeTtl" INTEGER NOT NULL DEFAULT 3600,
  "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "speedInsightsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "attackMode" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_edge_settings_pkey" PRIMARY KEY ("projectId")
);

CREATE TABLE "firewall_rules" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "firewall_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "environment_variables" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "encryptedValue" TEXT NOT NULL,
  "iv" TEXT NOT NULL,
  "authTag" TEXT NOT NULL,
  "targets" TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "environment_variables_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_routes" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "projectId" TEXT,
  "source" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "providerRuleId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_routes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "firewall_rules_projectId_priority_idx" ON "firewall_rules"("projectId", "priority");
CREATE UNIQUE INDEX "environment_variables_projectId_key_key" ON "environment_variables"("projectId", "key");
CREATE INDEX "environment_variables_projectId_createdAt_idx" ON "environment_variables"("projectId", "createdAt");
CREATE UNIQUE INDEX "email_routes_userId_source_key" ON "email_routes"("userId", "source");
CREATE INDEX "email_routes_projectId_createdAt_idx" ON "email_routes"("projectId", "createdAt");

ALTER TABLE "project_edge_settings" ADD CONSTRAINT "project_edge_settings_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "firewall_rules" ADD CONSTRAINT "firewall_rules_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "environment_variables" ADD CONSTRAINT "environment_variables_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_routes" ADD CONSTRAINT "email_routes_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_routes" ADD CONSTRAINT "email_routes_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
