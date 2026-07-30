CREATE TABLE "platform_sandboxes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'creating',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destroyedAt" TIMESTAMP(3),
    CONSTRAINT "platform_sandboxes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "platform_sandboxes_userId_status_createdAt_idx"
ON "platform_sandboxes"("userId", "status", "createdAt");

CREATE INDEX "platform_sandboxes_projectId_status_createdAt_idx"
ON "platform_sandboxes"("projectId", "status", "createdAt");

ALTER TABLE "platform_sandboxes"
ADD CONSTRAINT "platform_sandboxes_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "platform_sandboxes"
ADD CONSTRAINT "platform_sandboxes_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "deployment_webhook_events" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deployment_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deployment_webhook_events_provider_createdAt_idx"
ON "deployment_webhook_events"("provider", "createdAt");

CREATE TABLE "platform_workflows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "steps" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_workflows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_workflows_projectId_name_key"
ON "platform_workflows"("projectId", "name");
CREATE INDEX "platform_workflows_userId_createdAt_idx"
ON "platform_workflows"("userId", "createdAt");
CREATE INDEX "platform_workflows_projectId_enabled_createdAt_idx"
ON "platform_workflows"("projectId", "enabled", "createdAt");

CREATE TABLE "platform_workflow_crons" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "platform_workflow_crons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_workflow_crons_workflowId_expression_key"
ON "platform_workflow_crons"("workflowId", "expression");
CREATE INDEX "platform_workflow_crons_enabled_nextRunAt_idx"
ON "platform_workflow_crons"("enabled", "nextRunAt");

CREATE TABLE "platform_workflow_runs" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "cloudflareInstanceId" TEXT,
    "trigger" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "input" JSONB,
    "output" JSONB,
    "errorMessage" TEXT,
    "payloadBytes" INTEGER NOT NULL DEFAULT 0,
    "outputBytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "platform_workflow_runs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "platform_workflow_runs_cloudflareInstanceId_key"
ON "platform_workflow_runs"("cloudflareInstanceId");
CREATE INDEX "platform_workflow_runs_workflowId_createdAt_idx"
ON "platform_workflow_runs"("workflowId", "createdAt");
CREATE INDEX "platform_workflow_runs_projectId_status_createdAt_idx"
ON "platform_workflow_runs"("projectId", "status", "createdAt");

ALTER TABLE "platform_workflows"
ADD CONSTRAINT "platform_workflows_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_workflows"
ADD CONSTRAINT "platform_workflows_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_workflow_crons"
ADD CONSTRAINT "platform_workflow_crons_workflowId_fkey"
FOREIGN KEY ("workflowId") REFERENCES "platform_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_workflow_runs"
ADD CONSTRAINT "platform_workflow_runs_workflowId_fkey"
FOREIGN KEY ("workflowId") REFERENCES "platform_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_workflow_runs"
ADD CONSTRAINT "platform_workflow_runs_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deployment_logs"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'build',
ADD COLUMN "requestId" TEXT,
ADD COLUMN "traceId" TEXT;

CREATE INDEX "deployment_logs_deploymentId_source_createdAt_idx"
ON "deployment_logs"("deploymentId", "source", "createdAt");
CREATE INDEX "deployment_logs_requestId_idx" ON "deployment_logs"("requestId");

CREATE TABLE "project_log_drains" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "encryptedSecret" TEXT NOT NULL,
    "secretIv" TEXT NOT NULL,
    "secretAuthTag" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "project_log_drains_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "project_log_drains_projectId_name_key"
ON "project_log_drains"("projectId", "name");
CREATE INDEX "project_log_drains_projectId_enabled_createdAt_idx"
ON "project_log_drains"("projectId", "enabled", "createdAt");
CREATE INDEX "project_log_drains_userId_createdAt_idx"
ON "project_log_drains"("userId", "createdAt");

ALTER TABLE "project_log_drains"
ADD CONSTRAINT "project_log_drains_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_log_drains"
ADD CONSTRAINT "project_log_drains_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "sessions" ADD COLUMN "activeOrganizationId" TEXT;

CREATE TABLE "two_factors" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "two_factors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "two_factors_secret_key" ON "two_factors"("secret");
CREATE UNIQUE INDEX "two_factors_userId_key" ON "two_factors"("userId");
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'developer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key"
ON "organization_members"("organizationId", "userId");
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

CREATE TABLE "organization_invitations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviterId" TEXT NOT NULL,
    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "organization_invitations_organizationId_idx" ON "organization_invitations"("organizationId");
CREATE INDEX "organization_invitations_email_idx" ON "organization_invitations"("email");
CREATE INDEX "organization_invitations_inviterId_idx" ON "organization_invitations"("inviterId");

ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_invitations" ADD CONSTRAINT "organization_invitations_inviterId_fkey"
FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects" ADD COLUMN "organizationId" TEXT;
CREATE INDEX "projects_organizationId_idx" ON "projects"("organizationId");
CREATE UNIQUE INDEX "projects_organizationId_slug_key" ON "projects"("organizationId", "slug");
ALTER TABLE "projects" ADD CONSTRAINT "projects_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
