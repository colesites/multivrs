import type { ProviderId } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { Customer } from "./customer.types";
import { providersFor } from "./platform";

/** The customer's record at the provider, created once and remembered. */
export async function providerCustomerFor(
  deps: AppDeps,
  provider: ProviderId,
  account: string | null,
  customer: Customer,
): Promise<string> {
  const existing = await deps.billing.getProviderCustomer(customer.id, provider);
  if (existing) return existing;
  const { reference } = await providersFor(deps, customer.livemode ? "live" : "test")[
    provider
  ].ensureCustomer({
    merchantAccountId: account,
    customerId: customer.id,
    email: customer.email,
    name: customer.name,
    idempotencyKey: `vrs-customer-${customer.id}`,
  });
  await deps.billing.commit({
    providerCustomers: [{ customerId: customer.id, provider, reference }],
  });
  return (await deps.billing.getProviderCustomer(customer.id, provider)) ?? reference;
}
