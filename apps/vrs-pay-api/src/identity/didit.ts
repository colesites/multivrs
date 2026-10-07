import { z } from "zod";
import { type DiditConfig, diditRequest, diditUnavailable } from "./didit-http";
import type { IdentityCheck, IdentityResult, PersonDetails } from "./identity.types";
import { idTypeNotSupported } from "./identity-errors";
import { DOB_MISMATCH, isoDate, NAME_MISMATCH, namesMatch } from "./name-match";

/**
 * Our ID types → Didit's database validation service and the form field
 * that carries the number, by country. Anything not listed goes to the
 * document check. (Didit's BVN lookup also needs a selfie, so BVN isn't
 * here.)
 */
const DIDIT_SERVICES: Record<string, Record<string, { service: string; field: string }>> = {
  NG: { nin: { service: "nga_national_id", field: "national_id" } },
};

/** ISO 3166 alpha-2 → alpha-3, for the countries above. */
const ALPHA3: Record<string, string> = { NG: "NGA" };

const NOT_FOUND = "We couldn't find this ID number. Check it and try again.";
const UNDERAGE = "You must be at least 18.";
const NOT_ACCEPTED = "This ID can't be used. Choose another ID.";

/** No answer either way (registry down, still checking): retrying is safe. */
const NO_ANSWER = new Set(["INCONCLUSIVE", "REGISTRY_UNAVAILABLE", "REGISTRY_ERROR"]);
const NOT_FOUND_CODES = new Set([
  "NO_MATCH",
  "DOCUMENT_NOT_FOUND",
  "INVALID_DOCUMENT_FORMAT",
  "INVALID_INPUT",
]);

const ValidationSchema = z.object({
  outcome_code: z.string(),
  source_data: z
    .object({
      first_name: z.string().nullish(),
      last_name: z.string().nullish(),
      full_name: z.string().nullish(),
      date_of_birth: z.string().nullish(),
    })
    .nullish(),
  validation: z.record(z.string(), z.unknown()).nullish(),
});

const DatabaseValidationSchema = z.object({
  status: z.string().nullish(),
  validations: z.array(ValidationSchema).min(1),
});

type Validation = z.infer<typeof ValidationSchema>;

/** The registry gave no answer either way; retrying is safe. */
export type DiditOutcome = IdentityResult | { status: "unavailable"; detail: string };

/**
 * A partial match means the number exists but a name or the birth date
 * didn't match exactly. Registries list surnames first or add middle names,
 * so check the record ourselves before refusing.
 */
function partialMatch(validation: Validation, person: PersonDetails): IdentityResult {
  const record = validation.source_data;
  const fields = validation.validation ?? {};
  const names = [record?.first_name, record?.last_name, record?.full_name].map((n) => n ?? null);
  const nameOk = names.some(Boolean)
    ? namesMatch(names, person)
    : fields.first_name === "full_match" && fields.last_name === "full_match";
  if (!nameOk) return { status: "failed", reason: NAME_MISMATCH };
  const dob = isoDate(record?.date_of_birth);
  const dobOk = dob
    ? dob === person.dateOfBirth
    : fields.date_of_birth === undefined || fields.date_of_birth === "full_match";
  return dobOk ? { status: "verified" } : { status: "failed", reason: DOB_MISMATCH };
}

/** What one lookup means for the merchant. */
export function diditOutcome(validation: Validation, person: PersonDetails): DiditOutcome {
  const code = validation.outcome_code;
  if (code === "MATCH") return { status: "verified" };
  if (code === "PARTIAL_MATCH") return partialMatch(validation, person);
  if (NOT_FOUND_CODES.has(code)) return { status: "failed", reason: NOT_FOUND };
  if (code === "MINOR_BLOCKED") return { status: "failed", reason: UNDERAGE };
  if (code === "DECEASED" || code === "DOCUMENT_SUPERSEDED") {
    return { status: "failed", reason: NOT_ACCEPTED };
  }
  if (NO_ANSWER.has(code)) return { status: "unavailable", detail: code };
  return { status: "unavailable", detail: `unknown outcome ${code}` };
}

/** Instant lookups at the issuing registry. */
export interface RegistryVerifier {
  supports(country: string, idType: string): boolean;
  verify(check: IdentityCheck): Promise<IdentityResult>;
}

/**
 * Instant ID lookups at the issuer (Nigeria's NIN) through Didit's database
 * validation, for merchants with a NIN number but no slip or card. Each
 * lookup is paid.
 */
export function createDiditLookup(config: DiditConfig): RegistryVerifier {
  const serviceFor = (country: string, idType: string) => DIDIT_SERVICES[country]?.[idType];

  function lookup(check: IdentityCheck, service: { service: string; field: string }) {
    const form = new FormData();
    form.set("issuing_state", ALPHA3[check.country] ?? check.country);
    form.set("services", service.service);
    form.set(service.field, check.idNumber);
    form.set("first_name", check.firstName);
    form.set("last_name", check.lastName);
    form.set("date_of_birth", check.dateOfBirth);
    return diditRequest(config, "/v3/database-validation/", form);
  }

  return {
    supports: (country, idType) => serviceFor(country, idType) !== undefined,
    async verify(check) {
      const service = serviceFor(check.country, check.idType);
      if (!service) throw idTypeNotSupported();
      const parsed = DatabaseValidationSchema.safeParse(await lookup(check, service));
      if (!parsed.success) throw diditUnavailable("unexpected response");
      const [validation] = parsed.data.validations;
      const outcome = validation
        ? diditOutcome(validation, check)
        : ({ status: "unavailable", detail: "no validation" } as const);
      if (outcome.status === "unavailable") throw diditUnavailable(outcome.detail);
      return outcome;
    },
  };
}
