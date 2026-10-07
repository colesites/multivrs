import type { ProviderId } from "@vrs-pay/core";
import type { MerchantProfile } from "../../app.types";
import type { Db } from "../../db/client";
import { accountStatusFor } from "../../services/account-status";
import type { ApiKeyStore } from "../api-key.store";
import type { ProviderAccountStore, ProviderEventStore } from "../provider-account.store";

/** Resolves a secret key to its merchant, with only that mode's active accounts. */
export function createPrismaApiKeyStore(db: Db): ApiKeyStore {
  return {
    async findByHash(hash) {
      const key = await db.apiKey.findUnique({
        where: { hash },
        include: { merchant: { include: { providerAccounts: true } } },
      });
      if (!key || key.revokedAt || key.kind !== "secret") return null;
      const providerAccounts: Partial<Record<ProviderId, string>> = {};
      for (const account of key.merchant.providerAccounts) {
        if (account.mode === key.mode && account.status === "active") {
          providerAccounts[account.provider] = account.externalId;
        }
      }
      const merchant: MerchantProfile = {
        id: key.merchantId,
        name: key.merchant.name,
        enabledProviders: Object.keys(providerAccounts).filter(
          (p): p is ProviderId => p in providerAccounts,
        ),
        providerAccounts,
        platformFeeBps: key.merchant.platformFeeBps,
      };
      return { hash, merchant };
    },
  };
}

export function createPrismaProviderAccountStore(db: Db): ProviderAccountStore {
  return {
    async merchantProfile(merchantId, mode) {
      const merchant = await db.merchant.findUnique({
        where: { id: merchantId },
        include: { providerAccounts: { where: { mode, status: "active" } } },
      });
      if (!merchant) return null;
      const providerAccounts: Partial<Record<ProviderId, string>> = {};
      for (const a of merchant.providerAccounts) providerAccounts[a.provider] = a.externalId;
      return {
        id: merchant.id,
        name: merchant.name,
        enabledProviders: merchant.providerAccounts.map((a) => a.provider),
        providerAccounts,
        platformFeeBps: merchant.platformFeeBps,
      };
    },
    async findOwner(provider, externalId) {
      return db.providerAccount.findUnique({
        where: { provider_externalId: { provider, externalId } },
        select: { merchantId: true, mode: true },
      });
    },
    async updateStatus(provider, update) {
      await db.providerAccount.updateMany({
        where: { provider, externalId: update.accountId },
        data: {
          status: accountStatusFor(update),
          chargesEnabled: update.chargesEnabled,
          payoutsEnabled: update.payoutsEnabled,
          detailsSubmitted: update.detailsSubmitted,
        },
      });
    },
  };
}

export function createPrismaProviderEventStore(db: Db): ProviderEventStore {
  return {
    async has(provider, eventId) {
      const row = await db.providerEvent.findUnique({
        where: { provider_eventId: { provider, eventId } },
        select: { eventId: true },
      });
      return row !== null;
    },
    async add(provider, eventId, type) {
      await db.providerEvent.createMany({
        data: [{ provider, eventId, type }],
        skipDuplicates: true,
      });
    },
  };
}
