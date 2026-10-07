import { z } from "zod";
import type { IdentityResult, PersonDetails } from "./identity.types";
import { DOB_MISMATCH, isoDate, NAME_MISMATCH, namesMatch } from "./name-match";

/** Smile ID Enhanced KYC result codes. */
const ID_VALIDATED = "1012";
const ID_NOT_FOUND = "1013";
/** Smile ID's own name comparison, used only when the registry returns no full name. */
const NAMES_MATCHED = new Set(["Exact Match", "Transposed"]);

export const SmileIdResponseSchema = z.object({
  ResultCode: z.string(),
  ResultText: z.string().optional(),
  FullName: z.string().optional(),
  DOB: z.string().optional(),
  Actions: z
    .object({
      Verify_ID_Number: z.string().optional(),
      Names: z.string().optional(),
      DOB: z.string().optional(),
    })
    .optional(),
});
export type SmileIdResponse = z.infer<typeof SmileIdResponseSchema>;

/** Registries fill missing fields with "Not Available" instead of leaving them out. */
function known(value: string | undefined): string | null {
  return value && !/^not\s+available$/i.test(value.trim()) ? value : null;
}

/** The registry gave no answer either way (outage, account setup); retrying is safe. */
export type SmileIdOutcome = IdentityResult | { status: "unavailable"; detail: string };

/**
 * What a lookup means for the merchant: the ID number exists, and the name
 * and date of birth on record are theirs.
 */
export function smileIdOutcome(response: SmileIdResponse, person: PersonDetails): SmileIdOutcome {
  const { ResultCode, ResultText, Actions } = response;
  if (ResultCode === ID_NOT_FOUND || Actions?.Verify_ID_Number === "Not Verified") {
    return { status: "failed", reason: "We couldn't find this ID number. Check it and try again." };
  }
  if (ResultCode !== ID_VALIDATED) {
    return { status: "unavailable", detail: `${ResultCode} ${ResultText ?? ""}`.trim() };
  }
  const fullName = known(response.FullName);
  const nameOk = fullName
    ? namesMatch([fullName], person)
    : NAMES_MATCHED.has(Actions?.Names ?? "");
  if (!nameOk) return { status: "failed", reason: NAME_MISMATCH };
  const dob = isoDate(known(response.DOB));
  const dobOk = dob ? dob === person.dateOfBirth : Actions?.DOB !== "No Match";
  return dobOk ? { status: "verified" } : { status: "failed", reason: DOB_MISMATCH };
}
