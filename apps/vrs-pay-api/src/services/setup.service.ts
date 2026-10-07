import type { AppDeps } from "../app.types";
import { emptyOnboarding, type OnboardingRecord } from "./onboarding.types";
import { setupDetails } from "./setup-details";

export const STEP_IDS = [
  "product",
  "identity",
  "business",
  "payout",
  "description",
  "website",
  "support_email",
] as const;
export type StepId = (typeof STEP_IDS)[number];
export type AccountStatus = "setup" | "active" | "restricted";

interface Scope {
  id: string;
  mode: "test" | "live";
}

export async function loadOnboarding(deps: AppDeps, merchantId: string): Promise<OnboardingRecord> {
  return (await deps.onboarding.get(merchantId)) ?? emptyOnboarding(merchantId);
}

/** Something to sell: a product (or config plan) with a price, in test or live mode. */
async function hasProduct(deps: AppDeps, merchant: Scope): Promise<boolean> {
  const catalogs = await Promise.all(
    (["test", "live"] as const).map((mode) => deps.catalog.load({ merchantId: merchant.id, mode })),
  );
  return catalogs.some(({ plans }) =>
    plans.some((p) => p.active && p.prices.some((price) => price.active)),
  );
}

/** Registered companies need their legal name and number; everyone needs an address and phone. */
function businessDone(r: OnboardingRecord): boolean {
  const contact = Boolean(r.addressLine1 && r.city && r.phone);
  if (r.businessType === "company")
    return contact && Boolean(r.businessName && r.registrationNumber);
  return r.businessType === "individual" && contact;
}

/**
 * The "finish setting up" checklist. When every step is done the account
 * is active (live payments and payouts) — no separate submission. Staff can
 * hold an account, which overrides everything. `verificationUrl` is the
 * link to finish a document check, when one is waiting on the merchant.
 */
export async function accountSetup(
  deps: AppDeps,
  merchant: Scope,
  verificationUrl: string | null = null,
) {
  const record = await loadOnboarding(deps, merchant.id);
  const done: Record<StepId, boolean> = {
    product: await hasProduct(deps, merchant),
    identity: record.identityStatus === "verified",
    business: businessDone(record),
    payout: record.payoutDetails !== null,
    description: Boolean(record.productDescription),
    website: Boolean(record.website),
    support_email: Boolean(record.supportEmail),
  };
  const steps = STEP_IDS.map((id) => ({ id, done: done[id] }));
  const completed = steps.filter((s) => s.done).length;
  const status: AccountStatus =
    record.status === "rejected" ? "restricted" : completed === steps.length ? "active" : "setup";
  return {
    object: "account_setup" as const,
    status,
    hold_reason: status === "restricted" ? record.rejectionReason : null,
    steps,
    completed,
    total: steps.length,
    next: steps.find((s) => !s.done)?.id ?? null,
    details: setupDetails(record, verificationUrl),
  };
}
