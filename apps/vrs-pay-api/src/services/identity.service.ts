import { invalidRequest } from "@vrs-pay/core";
import type { AppDeps } from "../app.types";
import { findIdType, normalizeIdNumber } from "../identity/id-types";
import type { IdentityResult, PersonDetails } from "../identity/identity.types";
import { identityNotConfigured } from "../identity/identity-errors";
import type { IdentityInput } from "../routes/setup.schema";
import type { EventOutcome } from "./capture.service";
import { nowSeconds } from "./events";
import type { OnboardingRecord } from "./onboarding.types";
import { accountSetup, loadOnboarding } from "./setup.service";
import { seal } from "./setup-update.service";

type Scope = { id: string; mode: "test" | "live" };

/** A result as stored on the onboarding record. */
function resultFields(result: IdentityResult) {
  return {
    identityStatus: result.status,
    identityReason: result.status === "verified" ? null : result.reason,
    identitySessionId: result.status === "pending" ? result.session.id : null,
    identityCheckedAt: nowSeconds(),
  };
}

const sessionUrl = (result: IdentityResult) =>
  result.status === "pending" ? result.session.url : null;

/**
 * Checks the merchant's official ID for their business location (BVN/NIN
 * in Nigeria, Ghana Card, SA ID, passport…) and records the result. One
 * check covers test and live mode, like account activation on Stripe. IDs
 * a registry can't look up go to a document and selfie check, whose link
 * comes back as `verification_url`. The number is stored encrypted.
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
  if (!deps.identity) throw identityNotConfigured();
  const result = await deps.identity.verify({
    merchantId: merchant.id,
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
    ...resultFields(result),
  });
  return accountSetup(deps, merchant, sessionUrl(result));
}

function personOf({ firstName, lastName, dateOfBirth }: OnboardingRecord): PersonDetails | null {
  return firstName && lastName && dateOfBirth ? { firstName, lastName, dateOfBirth } : null;
}

/** Asks the provider how a pending session went and saves any change. Returns the link to continue it. */
async function resumeSession(deps: AppDeps, record: OnboardingRecord): Promise<string | null> {
  const person = personOf(record);
  if (!record.identitySessionId || !person || !deps.identity?.resume) return null;
  const result = await deps.identity.resume(record.identitySessionId, person);
  const fields = resultFields(result);
  const changed =
    fields.identityStatus !== record.identityStatus ||
    fields.identityReason !== record.identityReason;
  if (changed) await deps.onboarding.save({ ...record, ...fields });
  return sessionUrl(result);
}

/**
 * `GET /dashboard/setup`. Picks up a document check the merchant just
 * finished on the provider's page. If the provider is unreachable the
 * stored status stands; the webhook brings the update later.
 */
export async function setupWithIdentity(deps: AppDeps, merchant: Scope) {
  const record = await loadOnboarding(deps, merchant.id);
  let url: string | null = null;
  if (record.identityStatus === "pending") {
    try {
      url = await resumeSession(deps, record);
    } catch {
      url = null;
    }
  }
  return accountSetup(deps, merchant, url);
}

/** A provider webhook: the session changed. Only the merchant's current session counts. */
export async function syncIdentitySession(
  deps: AppDeps,
  data: { merchantId: string; sessionReference: string },
): Promise<EventOutcome> {
  const record = await deps.onboarding.get(data.merchantId);
  if (!record || record.identitySessionId !== data.sessionReference) return "ignored";
  if (record.identityStatus !== "pending") return "ignored";
  await resumeSession(deps, record);
  return "processed";
}
