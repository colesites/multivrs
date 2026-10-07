import type { AppDeps } from "../app.types";
import { emptyOnboarding, type OnboardingRecord } from "./onboarding.types";

export const STEP_IDS = [
  "product",
  "identity",
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

/** What the dashboard shows of the details: secrets reduced to their last 4 digits. */
function details(r: OnboardingRecord) {
  return {
    product_description: r.productDescription,
    website: r.website,
    support_email: r.supportEmail,
    payout: r.payoutDetails
      ? {
          currency: r.payoutCurrency,
          account_name: r.payoutAccountName,
          bank_name: r.payoutBankName,
          last4: r.payoutLast4,
        }
      : null,
    identity: {
      country: r.country,
      id_type: r.idType,
      last4: r.idLast4,
      first_name: r.firstName,
      last_name: r.lastName,
      date_of_birth: r.dateOfBirth,
      status: r.identityStatus,
      reason: r.identityReason,
    },
  };
}

/**
 * The "finish setting up" checklist. When every step is done the account
 * is active (live payments and payouts) — no separate submission. Staff can
 * hold an account, which overrides everything.
 */
export async function accountSetup(deps: AppDeps, merchant: Scope) {
  const record = await loadOnboarding(deps, merchant.id);
  const done: Record<StepId, boolean> = {
    product: await hasProduct(deps, merchant),
    identity: record.identityStatus === "verified",
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
    details: details(record),
  };
}
