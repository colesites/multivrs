ALTER TABLE "billing_subscriptions"
ADD COLUMN "organizationId" TEXT,
ADD COLUMN "stripeQuoteId" TEXT,
ADD COLUMN "planKey" TEXT NOT NULL DEFAULT 'pro',
ADD COLUMN "entitlementOverrides" JSONB,
ADD COLUMN "overageRateOverrides" JSONB,
ADD COLUMN "overagesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "spendLimitCents" INTEGER,
ADD COLUMN "spendAlertCents" INTEGER;

ALTER TABLE "projects"
ADD COLUMN "usageBlockedUntil" TIMESTAMP(3),
ADD COLUMN "usageBlockReason" TEXT;

ALTER TABLE "usage_events"
ADD COLUMN "billingSubscriptionId" TEXT,
ADD COLUMN "billingScopeKey" TEXT,
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "overageQuantity" BIGINT NOT NULL DEFAULT 0;

CREATE TABLE "billing_subscription_items" (
  "id" TEXT NOT NULL,
  "billingSubscriptionId" TEXT NOT NULL,
  "stripeSubscriptionItemId" TEXT NOT NULL,
  "stripePriceId" TEXT NOT NULL,
  "stripeProductId" TEXT NOT NULL,
  "lookupKey" TEXT,
  "productKey" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "projectIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "active" BOOLEAN NOT NULL DEFAULT true,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "billing_subscription_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_invoices" (
  "id" TEXT NOT NULL,
  "billingSubscriptionId" TEXT,
  "stripeInvoiceId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "currency" TEXT NOT NULL,
  "amountDueCents" INTEGER NOT NULL,
  "amountPaidCents" INTEGER NOT NULL,
  "amountRemainingCents" INTEGER NOT NULL,
  "hostedInvoiceUrl" TEXT,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "billing_meter_events" (
  "id" TEXT NOT NULL,
  "usageEventId" TEXT NOT NULL,
  "billingSubscriptionId" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "eventName" TEXT NOT NULL,
  "quantity" BIGINT NOT NULL,
  "estimatedCostCents" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "billing_meter_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_subscription_items_stripeSubscriptionItemId_key" ON "billing_subscription_items"("stripeSubscriptionItemId");
CREATE INDEX "billing_subscription_items_billingSubscriptionId_active_idx" ON "billing_subscription_items"("billingSubscriptionId", "active");
CREATE INDEX "billing_subscription_items_productKey_active_idx" ON "billing_subscription_items"("productKey", "active");
CREATE UNIQUE INDEX "billing_invoices_stripeInvoiceId_key" ON "billing_invoices"("stripeInvoiceId");
CREATE INDEX "billing_invoices_billingSubscriptionId_createdAt_idx" ON "billing_invoices"("billingSubscriptionId", "createdAt");
CREATE INDEX "billing_invoices_status_createdAt_idx" ON "billing_invoices"("status", "createdAt");
CREATE UNIQUE INDEX "billing_meter_events_usageEventId_key" ON "billing_meter_events"("usageEventId");
CREATE UNIQUE INDEX "billing_meter_events_identifier_key" ON "billing_meter_events"("identifier");
CREATE INDEX "billing_meter_events_status_createdAt_idx" ON "billing_meter_events"("status", "createdAt");
CREATE INDEX "billing_meter_events_billingSubscriptionId_createdAt_idx" ON "billing_meter_events"("billingSubscriptionId", "createdAt");
CREATE INDEX "billing_subscriptions_organizationId_status_idx" ON "billing_subscriptions"("organizationId", "status");
CREATE INDEX "billing_subscriptions_stripeQuoteId_idx" ON "billing_subscriptions"("stripeQuoteId");
CREATE INDEX "usage_events_billingSubscriptionId_metric_occurredAt_idx" ON "usage_events"("billingSubscriptionId", "metric", "occurredAt");
CREATE INDEX "usage_events_billingScopeKey_metric_occurredAt_idx" ON "usage_events"("billingScopeKey", "metric", "occurredAt");
CREATE UNIQUE INDEX "usage_events_idempotencyKey_key" ON "usage_events"("idempotencyKey");

ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "billing_subscription_items" ADD CONSTRAINT "billing_subscription_items_billingSubscriptionId_fkey" FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing_invoices" ADD CONSTRAINT "billing_invoices_billingSubscriptionId_fkey" FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_billingSubscriptionId_fkey" FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "billing_meter_events" ADD CONSTRAINT "billing_meter_events_usageEventId_fkey" FOREIGN KEY ("usageEventId") REFERENCES "usage_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "billing_meter_events" ADD CONSTRAINT "billing_meter_events_billingSubscriptionId_fkey" FOREIGN KEY ("billingSubscriptionId") REFERENCES "billing_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
