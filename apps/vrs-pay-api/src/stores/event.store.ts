import type { ApiKeyMode } from "@vrs-pay/core";
import type { VrsEvent } from "../services/event.types";

/** An event read back from storage: its object is whatever was sent. */
export type ListedEvent = Omit<VrsEvent, "data"> & { data: { object: object } };

/** The events sent to a merchant, for the dashboard and `GET /v1/events`. */
export interface EventStore {
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<ListedEvent[]>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<ListedEvent | null>;
}
