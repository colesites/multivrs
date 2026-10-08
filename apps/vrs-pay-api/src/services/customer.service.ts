import { invalidRequest, newId, randomBase62, resourceMissing, sha256Hex } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import type {
  CreateCustomerInput,
  CreateCustomerSessionInput,
  UpdateCustomerInput,
} from "../routes/customer.schema";
import type { Customer, CustomerSession, StoredCustomer } from "./customer.types";
import { nowSeconds } from "./events";

export const CUSTOMER_SESSION_TTL_SECONDS = 30 * 60;
const SECRET_LENGTH = 32;

function newCustomer(merchant: MerchantContext, input: CreateCustomerInput): StoredCustomer {
  return {
    merchantId: merchant.id,
    mode: merchant.mode,
    customer: {
      id: newId("customer"),
      object: "customer",
      livemode: merchant.mode === "live",
      external_id: input.external_id,
      type: input.type,
      email: input.email ?? null,
      name: input.name ?? null,
      metadata: input.metadata,
      created: nowSeconds(),
    },
  };
}

export async function createCustomer(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateCustomerInput,
) {
  const record = newCustomer(merchant, input);
  if (!(await deps.customers.create(record))) {
    throw invalidRequest(
      "resource_already_exists",
      `A customer with external_id '${input.external_id}' already exists.`,
      "external_id",
    );
  }
  return record.customer;
}

export async function getCustomer(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
): Promise<Customer> {
  const record = await deps.customers.get(merchant.id, merchant.mode, id);
  if (!record) throw resourceMissing("customer", id);
  return record.customer;
}

export async function findCustomer(deps: AppDeps, merchant: MerchantContext, externalId: string) {
  const record = await deps.customers.findByExternalId(merchant.id, merchant.mode, externalId);
  if (!record) throw resourceMissing("customer", externalId);
  return record.customer;
}

/** Customers made by a payment link start without an email or name; their checkout fills it in. */
export async function fillMissingCustomerDetails(
  deps: AppDeps,
  scope: { merchantId: string; mode: MerchantContext["mode"] },
  customerId: string | null,
  email: string | null,
  name?: string | null,
  country?: string | null,
) {
  if (!customerId) return;
  const record = await deps.customers.get(scope.merchantId, scope.mode, customerId);
  if (!record) return;
  const patch: CustomerPatch = {};
  if (email && !record.customer.email) patch.email = email;
  if (name && !record.customer.name) patch.name = name;
  if (country && !record.customer.metadata?.country) {
    patch.metadata = { ...(record.customer.metadata ?? {}), country };
  }
  if (Object.keys(patch).length > 0) {
    await deps.customers.update(scope.merchantId, scope.mode, customerId, patch);
  }
}

export const fillMissingEmail = fillMissingCustomerDetails;

export async function updateCustomer(
  deps: AppDeps,
  merchant: MerchantContext,
  id: string,
  patch: UpdateCustomerInput,
) {
  const record = await deps.customers.update(merchant.id, merchant.mode, id, patch);
  if (!record) throw resourceMissing("customer", id);
  return record.customer;
}

/** The customer by id, or by external id — created on first use. */
async function resolveCustomer(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateCustomerSessionInput,
) {
  if (input.customer) return getCustomer(deps, merchant, input.customer);
  const externalId = input.external_id ?? "";
  const existing = await deps.customers.findByExternalId(merchant.id, merchant.mode, externalId);
  if (existing) return existing.customer;
  const record = newCustomer(merchant, { ...input, external_id: externalId, metadata: {} });
  if (await deps.customers.create(record)) return record.customer;
  // Created concurrently by another request: use that one.
  return findCustomer(deps, merchant, externalId);
}

/** A browser-safe secret for one customer, valid for 30 minutes. */
export async function createCustomerSession(
  deps: AppDeps,
  merchant: MerchantContext,
  input: CreateCustomerSessionInput,
): Promise<CustomerSession> {
  const customer = await resolveCustomer(deps, merchant, input);
  const id = newId("customerSession");
  const clientSecret = `${id}_secret_${randomBase62(SECRET_LENGTH)}`;
  const expiresAt = nowSeconds() + CUSTOMER_SESSION_TTL_SECONDS;
  await deps.customers.createSession({
    id,
    customerId: customer.id,
    secretHash: await sha256Hex(clientSecret),
    expiresAt: new Date(expiresAt * 1000),
  });
  return {
    id,
    object: "customer_session",
    livemode: merchant.mode === "live",
    customer,
    client_secret: clientSecret,
    expires_at: expiresAt,
  };
}
