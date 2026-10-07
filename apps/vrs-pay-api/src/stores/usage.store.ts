import type { StoredUsageRecord, UsageWindow } from "../services/usage.types";

export interface UsageStore {
  add(record: StoredUsageRecord): Promise<void>;
  /** The window's records added up: total, highest or latest. 0 when there are none. */
  total(window: UsageWindow): Promise<number>;
}
