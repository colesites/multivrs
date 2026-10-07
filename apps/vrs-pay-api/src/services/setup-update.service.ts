import { invalidRequest } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import { findIdType, normalizeIdNumber } from "../identity/id-types";
import { manualVerifier, sandboxVerifier } from "../identity/verifiers";
import type { IdentityInput, SetupUpdate } from "../routes/setup.schema";
import { nowSeconds } from "./events";
import type { OnboardingRecord } from "./onboarding.types";
import { accountSetup, loadOnboarding } from "./setup.service";

type Scope = { id: string; mode: "test" | "live" };

async function seal(deps: AppDeps, value: string): Promise<string> {
  if (!deps.sealer)
    throw invalidRequest(
      "encryption_unavailable",
      "Saving this isn't configured on this server yet.",
    );
  return deps.sealer.seal(value);
}

/** Saves any of the simple steps (description, website, support email, payout bank). */
export async function updateSetup(deps: AppDeps, merchant: Scope, input: SetupUpdate) {
  const current = await loadOnboarding(deps, merchant.id);
  const next: OnboardingRecord = {
    ...current,
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

/**
 * Checks the merchant's official ID for their business location (BVN/NIN
 * in Nigeria, Ghana Card, SA ID, passport…) and records the result. The
 * number is stored encrypted.
 */
export async function verifyIdentity(deps: AppDeps, merchant: Scope, input: IdentityInput) {
  const idType = findIdType(input.country, input.id_type);
  if (!idType)
    throw invalidRequest("id_type_invalid", "Choose an ID accepted in your country.", "id_type");
  const idNumber = normalizeIdNumber(input.id_number);
  if (!idType.pattern.test(idNumber)) {
    throw invalidRequest(
      "id_number_invalid",
      `That doesn't look like a valid ${idType.label} (${idType.hint}).`,
      "id_number",
    );
  }
  // Test mode never contacts an identity provider; live without one goes to our team.
  const verifier = merchant.mode === "test" ? sandboxVerifier : (deps.identity ?? manualVerifier);
  const result = await verifier.verify({
    country: input.country,
    idType: idType.id,
    idNumber,
    firstName: input.first_name,
    lastName: input.last_name,
    dateOfBirth: input.date_of_birth,
  });
  const current = await loadOnboarding(deps, merchant.id);
  await deps.onboarding.save({
    ...current,
    country: input.country,
    idType: idType.id,
    idNumber: await seal(deps, idNumber),
    idLast4: idNumber.slice(-4),
    firstName: input.first_name,
    lastName: input.last_name,
    dateOfBirth: input.date_of_birth,
    identityStatus: result.status,
    identityReason: result.status === "verified" ? null : result.reason,
    identityCheckedAt: nowSeconds(),
  });
  return accountSetup(deps, merchant);
}
