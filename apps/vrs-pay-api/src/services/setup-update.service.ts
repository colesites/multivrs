import { invalidRequest } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import type { BusinessInput, SetupUpdate } from "../routes/setup.schema";
import type { OnboardingRecord } from "./onboarding.types";
import { accountSetup, loadOnboarding } from "./setup.service";

type Scope = { id: string; mode: "test" | "live" };

export async function seal(deps: AppDeps, value: string): Promise<string> {
  if (!deps.sealer)
    throw invalidRequest(
      "encryption_unavailable",
      "Saving this isn't configured on this server yet.",
    );
  return deps.sealer.seal(value);
}

/**
 * Registered businesses give their legal name and registration number;
 * individuals and sole traders can add a trading name. Both give an
 * address and phone number. Switching type clears what no longer applies.
 */
function businessFields(business: BusinessInput) {
  const { address } = business;
  return {
    businessType: business.type,
    businessName: business.name || null,
    registrationNumber: business.type === "company" ? business.registration_number : null,
    addressLine1: address.line1,
    addressLine2: address.line2 || null,
    city: address.city,
    postalCode: address.postal_code || null,
    phone: business.phone,
  };
}

/** Saves any of the simple steps (business, description, website, support email, payout bank). */
export async function updateSetup(deps: AppDeps, merchant: Scope, input: SetupUpdate) {
  const current = await loadOnboarding(deps, merchant.id);
  const next: OnboardingRecord = {
    ...current,
    ...(input.business ? businessFields(input.business) : {}),
    productDescription: input.product_description ?? current.productDescription,
    website: input.website ?? current.website,
    supportEmail: input.support_email ?? current.supportEmail,
  };
  if (input.payout) {
    const { account_number, bank_code, currency, account_name, bank_name } = input.payout;
    const digits = account_number.replace(/\s+/g, "");
    next.payoutDetails = await seal(
      deps,
      JSON.stringify({ accountNumber: digits, bankCode: bank_code ?? null }),
    );
    next.payoutLast4 = digits.slice(-4);
    next.payoutCurrency = currency;
    next.payoutAccountName = account_name;
    next.payoutBankName = bank_name;
  }
  await deps.onboarding.save(next);
  return accountSetup(deps, merchant);
}
