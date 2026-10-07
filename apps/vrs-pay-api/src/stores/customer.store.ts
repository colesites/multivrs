import type { ApiKeyMode } from "@vrs-pay/core";
import type {
  CustomerPatch,
  StoredCustomer,
  StoredCustomerSession,
} from "../services/customer.types";

export interface CustomerStore {
  /** False when the external id is already taken in this mode. */
  create(record: StoredCustomer): Promise<boolean>;
  get(merchantId: string, mode: ApiKeyMode, id: string): Promise<StoredCustomer | null>;
  findByExternalId(
    merchantId: string,
    mode: ApiKeyMode,
    externalId: string,
  ): Promise<StoredCustomer | null>;
  update(
    merchantId: string,
    mode: ApiKeyMode,
    id: string,
    patch: CustomerPatch,
  ): Promise<StoredCustomer | null>;
  /** Newest first. */
  list(merchantId: string, mode: ApiKeyMode, limit: number): Promise<StoredCustomer[]>;
  createSession(session: StoredCustomerSession): Promise<void>;
  /** The customer behind an unexpired session secret (by hash). */
  findBySession(secretHash: string, now: Date): Promise<StoredCustomer | null>;
}
