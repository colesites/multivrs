import type { EventStore } from "../event.store";
import type { MemoryState } from "./state";

export function createMemoryEventStore(state: MemoryState): EventStore {
  const owned = (merchantId: string, mode: string) =>
    state.events.filter((e) => e.merchantId === merchantId && e.mode === mode);
  return {
    async list(merchantId, mode, limit) {
      return owned(merchantId, mode)
        .map((e) => e.event)
        .reverse()
        .slice(0, limit);
    },
    async get(merchantId, mode, id) {
      return owned(merchantId, mode).find((e) => e.event.id === id)?.event ?? null;
    },
  };
}
