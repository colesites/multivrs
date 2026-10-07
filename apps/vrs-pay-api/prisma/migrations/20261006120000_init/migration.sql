-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "ApiKeyKind" AS ENUM ('secret', 'publishable');

-- CreateEnum
CREATE TYPE "ProviderAccountStatus" AS ENUM ('pending', 'active', 'restricted');

-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('open', 'complete', 'expired');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('succeeded', 'partially_refunded', 'refunded');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('test', 'live');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('stripe', 'paystack', 'flutterwave');

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "scope" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'in_progress',
    "response_status" INTEGER,
    "response_body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("scope","key")
);

-- CreateTable
CREATE TABLE "provider_events" (
    "provider" "Provider" NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_events_pkey" PRIMARY KEY ("provider","event_id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "enabled_events" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabled_at" TIMESTAMP(3),

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "endpoint_id" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_status_code" INTEGER,
    "last_error" TEXT,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "account_kind" TEXT NOT NULL,
    "account_owner" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "platform_fee_bps" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "kind" "ApiKeyKind" NOT NULL,
    "hash" TEXT NOT NULL,
    "display_prefix" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_accounts" (
    "id" UUID NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "provider" "Provider" NOT NULL,
    "external_id" TEXT NOT NULL,
    "status" "ProviderAccountStatus" NOT NULL DEFAULT 'pending',
    "charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "details_submitted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_sessions" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'open',
    "amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "payment_method" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform_fee" BIGINT NOT NULL,
    "success_url" TEXT NOT NULL,
    "cancel_url" TEXT NOT NULL,
    "customer_email" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "checkout_session_id" TEXT,
    "provider" "Provider" NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "provider_reference" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'succeeded',
    "amount" BIGINT NOT NULL,
    "amount_refunded" BIGINT NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL,
    "platform_fee" BIGINT NOT NULL,
    "provider_fee" BIGINT NOT NULL,
    "customer_email" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "payment_id" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_reference" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "amount" BIGINT NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "reason" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE INDEX "events_merchant_id_mode_created_at_idx" ON "events"("merchant_id", "mode", "created_at" DESC);

-- CreateIndex
CREATE INDEX "webhook_endpoints_merchant_id_mode_idx" ON "webhook_endpoints"("merchant_id", "mode");

-- CreateIndex
CREATE INDEX "webhook_deliveries_status_next_attempt_at_idx" ON "webhook_deliveries"("status", "next_attempt_at");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_deliveries_event_id_endpoint_id_key" ON "webhook_deliveries"("event_id", "endpoint_id");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_transactions_source_type_source_id_key" ON "ledger_transactions"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "ledger_entries_transaction_id_idx" ON "ledger_entries"("transaction_id");

-- CreateIndex
CREATE INDEX "ledger_entries_account_kind_account_owner_mode_currency_idx" ON "ledger_entries"("account_kind", "account_owner", "mode", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hash_key" ON "api_keys"("hash");

-- CreateIndex
CREATE INDEX "api_keys_merchant_id_idx" ON "api_keys"("merchant_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_accounts_merchant_id_mode_provider_key" ON "provider_accounts"("merchant_id", "mode", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "provider_accounts_provider_external_id_key" ON "provider_accounts"("provider", "external_id");

-- CreateIndex
CREATE INDEX "checkout_sessions_merchant_id_mode_created_at_idx" ON "checkout_sessions"("merchant_id", "mode", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "checkout_sessions_provider_provider_reference_key" ON "checkout_sessions"("provider", "provider_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_checkout_session_id_key" ON "payments"("checkout_session_id");

-- CreateIndex
CREATE INDEX "payments_merchant_id_mode_created_at_idx" ON "payments"("merchant_id", "mode", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_provider_reference_key" ON "payments"("provider", "provider_reference");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_provider_provider_reference_key" ON "refunds"("provider", "provider_reference");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "ledger_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_accounts" ADD CONSTRAINT "provider_accounts_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_checkout_session_id_fkey" FOREIGN KEY ("checkout_session_id") REFERENCES "checkout_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Supabase exposes the public schema through its Data API. VRS Pay only
-- talks to Postgres directly, so turn on RLS with no policies: the anon and
-- authenticated roles get nothing, the table owner (Prisma) is unaffected.
ALTER TABLE "idempotency_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provider_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_endpoints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ledger_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "merchants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "provider_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "checkout_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;
