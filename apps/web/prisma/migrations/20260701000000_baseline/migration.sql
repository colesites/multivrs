CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE "public"."users" (
  "id" TEXT NOT NULL, "email" TEXT NOT NULL, "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "name" TEXT NOT NULL, "username" TEXT, "displayUsername" TEXT, "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."accounts" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "accountId" TEXT NOT NULL, "providerId" TEXT NOT NULL,
  "accessToken" TEXT, "refreshToken" TEXT, "idToken" TEXT, "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3), "scope" TEXT, "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."sessions" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "token" TEXT NOT NULL,
  "ipAddress" TEXT, "userAgent" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."verifications" (
  "id" TEXT NOT NULL, "identifier" TEXT NOT NULL, "value" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."projects" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "framework" TEXT, "ownerId" TEXT NOT NULL,
  "productionDeploymentId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."deployments" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'queued',
  "target" TEXT NOT NULL DEFAULT 'preview', "renderMode" TEXT, "commitSha" TEXT, "branch" TEXT,
  "artifactHash" TEXT, "url" TEXT, "startedAt" TIMESTAMP(3), "finishedAt" TIMESTAMP(3), "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."deployment_logs" (
  "id" TEXT NOT NULL, "deploymentId" TEXT NOT NULL, "level" TEXT NOT NULL DEFAULT 'info', "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "deployment_logs_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."domains" (
  "id" TEXT NOT NULL, "projectId" TEXT NOT NULL, "hostname" TEXT NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false, "certStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."domain_orders" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "projectId" TEXT NOT NULL, "hostname" TEXT NOT NULL,
  "amount" INTEGER NOT NULL, "currency" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'pending',
  "stripeSessionId" TEXT, "providerDomainId" TEXT, "failureMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "domain_orders_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."api_tokens" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "tokenHash" TEXT NOT NULL,
  "tokenHint" TEXT NOT NULL, "lastUsedAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."billing_subscriptions" (
  "id" TEXT NOT NULL, "userId" TEXT, "stripeCustomerId" TEXT NOT NULL, "stripeSubscriptionId" TEXT NOT NULL,
  "stripePriceId" TEXT NOT NULL, "stripeProductId" TEXT NOT NULL, "status" TEXT NOT NULL,
  "lastPaymentStatus" TEXT NOT NULL DEFAULT 'unknown', "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3), "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."stripe_webhook_events" (
  "id" TEXT NOT NULL, "type" TEXT NOT NULL, "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
CREATE INDEX "users_email_idx" ON "public"."users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");
CREATE INDEX "users_username_idx" ON "public"."users"("username");
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "public"."accounts"("providerId", "accountId");
CREATE INDEX "accounts_userId_idx" ON "public"."accounts"("userId");
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");
CREATE INDEX "sessions_token_idx" ON "public"."sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "public"."sessions"("userId");
CREATE UNIQUE INDEX "verifications_identifier_value_key" ON "public"."verifications"("identifier", "value");
CREATE UNIQUE INDEX "projects_slug_key" ON "public"."projects"("slug");
CREATE UNIQUE INDEX "projects_productionDeploymentId_key" ON "public"."projects"("productionDeploymentId");
CREATE INDEX "projects_ownerId_idx" ON "public"."projects"("ownerId");
CREATE INDEX "deployments_projectId_idx" ON "public"."deployments"("projectId");
CREATE INDEX "deployment_logs_deploymentId_createdAt_idx" ON "public"."deployment_logs"("deploymentId", "createdAt");
CREATE UNIQUE INDEX "domains_hostname_key" ON "public"."domains"("hostname");
CREATE INDEX "domains_projectId_idx" ON "public"."domains"("projectId");
CREATE UNIQUE INDEX "domain_orders_stripeSessionId_key" ON "public"."domain_orders"("stripeSessionId");
CREATE INDEX "domain_orders_userId_createdAt_idx" ON "public"."domain_orders"("userId", "createdAt");
CREATE INDEX "domain_orders_hostname_status_idx" ON "public"."domain_orders"("hostname", "status");
CREATE UNIQUE INDEX "api_tokens_tokenHash_key" ON "public"."api_tokens"("tokenHash");
CREATE INDEX "api_tokens_userId_createdAt_idx" ON "public"."api_tokens"("userId", "createdAt");
CREATE UNIQUE INDEX "billing_subscriptions_stripeSubscriptionId_key" ON "public"."billing_subscriptions"("stripeSubscriptionId");
CREATE INDEX "billing_subscriptions_userId_status_idx" ON "public"."billing_subscriptions"("userId", "status");
CREATE INDEX "billing_subscriptions_stripeCustomerId_idx" ON "public"."billing_subscriptions"("stripeCustomerId");

ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_productionDeploymentId_fkey" FOREIGN KEY ("productionDeploymentId") REFERENCES "public"."deployments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."deployments" ADD CONSTRAINT "deployments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."deployment_logs" ADD CONSTRAINT "deployment_logs_deploymentId_fkey" FOREIGN KEY ("deploymentId") REFERENCES "public"."deployments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."domains" ADD CONSTRAINT "domains_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."domain_orders" ADD CONSTRAINT "domain_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."domain_orders" ADD CONSTRAINT "domain_orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."api_tokens" ADD CONSTRAINT "api_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
