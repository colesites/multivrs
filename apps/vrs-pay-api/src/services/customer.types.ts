import type { ApiKeyMode } from "@vrs-pay/core";

export type CustomerType = "user" | "org";

/** The public shape of a customer: one of the merchant's users or organizations. */
export interface Customer {
  id: string;
  object: "customer";
  livemode: boolean;
  /** The merchant's own id for this user or org. Unique per mode. */
  external_id: string;
  type: CustomerType;
  email: string | null;
  name: string | null;
  metadata: Record<string, string>;
  created: number;
}

export interface StoredCustomer {
  merchantId: string;
  mode: ApiKeyMode;
  customer: Customer;
}

export type CustomerPatch = Partial<Pick<Customer, "email" | "name" | "metadata">>;

/** Returned once on create; only a hash of `client_secret` is kept. */
export interface CustomerSession {
  id: string;
  object: "customer_session";
  livemode: boolean;
  customer: Customer;
  client_secret: string;
  /** Unix seconds. */
  expires_at: number;
}

export interface StoredCustomerSession {
  id: string;
  customerId: string;
  secretHash: string;
  expiresAt: Date;
}
