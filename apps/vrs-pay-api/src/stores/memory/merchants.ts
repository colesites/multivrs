import type { MerchantStore, ProviderAccountRecord } from "../merchant.store";
import type { MemoryApiKeyStore } from "./api-keys";
import type { MemoryState } from "./state";

/** In-memory merchants; keys added here also authenticate through `apiKeys`. */
export function createMemoryMerchantStore(
  state: MemoryState,
  apiKeys: MemoryApiKeyStore,
): MerchantStore {
  const accounts = new Map<string, ProviderAccountRecord & { merchantId: string; mode: string }>();
  return {
    async forUser(userId) {
      return state.members.get(userId)?.[0] ?? null;
    },
    async listForUser(userId) {
      return (state.members.get(userId) ?? []).map((m) => ({
        ...m,
        name: state.merchantRecords.get(m.merchantId)?.name ?? "",
      }));
    },
    async createForUser(user, merchant) {
      state.merchantRecords.set(merchant.id, merchant);
      const memberships = state.members.get(user.id) ?? [];
      state.members.set(user.id, [...memberships, { merchantId: merchant.id, role: "owner" }]);
      state.merchants.set(merchant.id, {
        id: merchant.id,
        name: merchant.name,
        enabledProviders: [],
        providerAccounts: {},
        platformFeeBps: merchant.platformFeeBps,
      });
    },
    async get(merchantId) {
      return state.merchantRecords.get(merchantId) ?? null;
    },
    async rename(merchantId, name) {
      const m = state.merchantRecords.get(merchantId);
      if (m) state.merchantRecords.set(merchantId, { ...m, name });
    },
    async listKeys(merchantId, mode) {
      return state.keys
        .filter((k) => k.merchantId === merchantId && (k.livemode ? "live" : "test") === mode)
        .map(({ merchantId: _, ...k }) => k);
    },
    async addKey(merchantId, key) {
      const profile = state.merchants.get(merchantId);
      if (profile) await apiKeys.add({ hash: key.hash, merchant: profile });
      state.keys.unshift({
        merchantId,
        id: key.id,
        object: "api_key",
        kind: key.kind,
        livemode: key.mode === "live",
        display_prefix: key.displayPrefix,
        created: Math.floor(Date.now() / 1000),
        revoked: false,
      });
    },
    async revokeKey(merchantId, id) {
      const key = state.keys.find((k) => k.id === id && k.merchantId === merchantId && !k.revoked);
      if (!key) return false;
      key.revoked = true;
      return true;
    },
    async getProviderAccount(merchantId, mode, provider) {
      const a = accounts.get(`${merchantId}:${mode}:${provider}`);
      if (!a) return null;
      const { merchantId: _m, mode: _mode, ...record } = a;
      return record;
    },
    async saveProviderAccount(merchantId, mode, account) {
      accounts.set(`${merchantId}:${mode}:${account.provider}`, { ...account, merchantId, mode });
      state.accounts.set(`${account.provider}:${account.externalId}`, {
        merchantId,
        mode: mode === "live" ? "live" : "test",
        status: account.status,
      });
      const profile = state.merchants.get(merchantId);
      if (profile && account.status === "active") {
        const providerAccounts = {
          ...profile.providerAccounts,
          [account.provider]: account.externalId,
        };
        state.merchants.set(merchantId, {
          ...profile,
          providerAccounts,
          enabledProviders: [...new Set([...profile.enabledProviders, account.provider])],
        });
      }
    },
  };
}
