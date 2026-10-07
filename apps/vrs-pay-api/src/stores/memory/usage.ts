import type { StoredUsageRecord } from "../../services/usage.types";
import type { UsageStore } from "../usage.store";

export function createMemoryUsageStore(records: StoredUsageRecord[] = []): UsageStore {
  return {
    async add(record) {
      records.push(record);
    },
    async total({ subscriptionId, from, to, aggregate }) {
      const inWindow = records
        .map((r) => r.record)
        .filter(
          (r) => r.subscription === subscriptionId && r.timestamp >= from && r.timestamp < to,
        );
      if (inWindow.length === 0) return 0;
      if (aggregate === "sum") return inWindow.reduce((sum, r) => sum + r.quantity, 0);
      if (aggregate === "max") return Math.max(...inWindow.map((r) => r.quantity));
      const latest = inWindow.reduce((a, b) => (b.timestamp >= a.timestamp ? b : a));
      return latest.quantity;
    },
  };
}
