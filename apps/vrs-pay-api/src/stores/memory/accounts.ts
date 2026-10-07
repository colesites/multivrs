import { accountStatusFor } from "../../services/account-status";
import type { ProviderAccountStore, ProviderEventStore } from "../provider-account.store";
import type { MemoryState } from "./state";

export function createMemoryProviderAccountStore(state: MemoryState): ProviderAccountStore {
  return {
    async findOwner(provider, externalId) {
      const account = state.accounts.get(`${provider}:${externalId}`);
      return account ? { merchantId: account.merchantId, mode: account.mode } : null;
    },
    async merchantProfile(merchantId) {
      return state.merchants.get(merchantId) ?? null;
    },
    async updateStatus(provider, update) {
      const key = `${provider}:${update.accountId}`;
      const account = state.accounts.get(key);
      if (account) state.accounts.set(key, { ...account, status: accountStatusFor(update) });
    },
  };
}

export function createMemoryProviderEventStore(state: MemoryState): ProviderEventStore {
  return {
    async has(provider, eventId) {
      return state.providerEvents.has(`${provider}:${eventId}`);
    },
    async add(provider, eventId) {
      state.providerEvents.add(`${provider}:${eventId}`);
    },
  };
}
