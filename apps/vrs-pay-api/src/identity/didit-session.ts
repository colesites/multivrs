import { z } from "zod";
import { type DiditConfig, diditRequest, diditUnavailable } from "./didit-http";
import type { IdentityResult, IdentityVerifier, PersonDetails } from "./identity.types";
import { DOB_MISMATCH, isoDate, NAME_MISMATCH, namesMatch } from "./name-match";

/** Didit metadata key tying a session to its merchant (vendor_data holds the id too). */
export const DIDIT_MERCHANT_METADATA_KEY = "vrs_merchant_id";

const WAITING = "Finish the check: scan your ID and take a selfie.";
const REVIEWING = "We're checking your document. This usually takes a few minutes.";
const DECLINED = "We couldn't verify your ID. Try again with a clear photo of a current ID.";
const UNFINISHED = "The check wasn't finished. Verify again to restart it.";
const NO_DOCUMENT = "The check didn't read an ID document. Verify again and scan your ID.";
const SANDBOX = "This check ran in Didit's sandbox, which can't unlock live payments.";

/** Session statuses that wait on the merchant. "In Review" waits on Didit. */
const WAITING_STATUSES = new Set(["Not Started", "In Progress", "Awaiting User", "Resubmitted"]);
const UNFINISHED_STATUSES = new Set(["Expired", "Abandoned", "Kyc Expired"]);

const CreatedSessionSchema = z.object({ session_id: z.string(), url: z.string() });

const IdVerificationSchema = z.object({
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  full_name: z.string().nullish(),
  date_of_birth: z.string().nullish(),
});

const DecisionSchema = z.object({
  session_id: z.string(),
  status: z.string(),
  session_url: z.string().nullish(),
  environment: z.string().nullish(),
  id_verifications: z.array(IdVerificationSchema).nullish(),
});

type IdVerification = z.infer<typeof IdVerificationSchema>;

export interface DiditSessionConfig extends DiditConfig {
  /** The workflow from the Didit console: ID document, liveness and face match. */
  workflowId: string;
  /** Where Didit sends the merchant back to (the setup page). */
  returnUrl: string;
  /** Local development only: a server with a database refuses sandbox results. */
  allowSandbox?: boolean;
}

/** Didit read the document; it still has to be the person the merchant said they are. */
function matchDocument(ids: IdVerification[], person: PersonDetails): IdentityResult {
  if (ids.length === 0) return { status: "failed", reason: NO_DOCUMENT };
  const named = ids.filter((id) =>
    namesMatch([id.first_name ?? null, id.last_name ?? null, id.full_name ?? null], person),
  );
  if (named.length === 0) return { status: "failed", reason: NAME_MISMATCH };
  if (!named.some((id) => isoDate(id.date_of_birth) === person.dateOfBirth)) {
    return { status: "failed", reason: DOB_MISMATCH };
  }
  return { status: "verified" };
}

async function parse<T>(schema: z.ZodType<T>, work: Promise<unknown>): Promise<T> {
  const parsed = schema.safeParse(await work);
  if (!parsed.success) throw diditUnavailable("unexpected response");
  return parsed.data;
}

/**
 * A document and selfie check on Didit's page: the merchant scans their ID
 * (a NIN slip or card, passport, driver's licence, voter's card…) and takes
 * a live selfie, Didit matches the two, and we match the name and birth
 * date on the ID to what the merchant typed.
 */
export function createDiditDocumentVerifier(
  config: DiditSessionConfig,
): Required<IdentityVerifier> {
  return {
    async verify(check) {
      const session = await parse(
        CreatedSessionSchema,
        diditRequest(config, "/v3/session/", {
          workflow_id: config.workflowId,
          vendor_data: check.merchantId,
          callback: config.returnUrl,
          metadata: { [DIDIT_MERCHANT_METADATA_KEY]: check.merchantId },
        }),
      );
      return {
        status: "pending",
        reason: WAITING,
        session: { id: session.session_id, url: session.url },
      };
    },
    async resume(sessionId, person) {
      const decision = await parse(
        DecisionSchema,
        diditRequest(config, `/v3/session/${encodeURIComponent(sessionId)}/decision/`),
      );
      const pending = (reason: string, url: string | null): IdentityResult => ({
        status: "pending",
        reason,
        session: { id: decision.session_id, url },
      });
      if (decision.status === "Approved") {
        if (decision.environment === "sandbox" && !config.allowSandbox) {
          return { status: "failed", reason: SANDBOX };
        }
        return matchDocument(decision.id_verifications ?? [], person);
      }
      if (decision.status === "Declined") return { status: "failed", reason: DECLINED };
      if (UNFINISHED_STATUSES.has(decision.status)) return { status: "failed", reason: UNFINISHED };
      if (WAITING_STATUSES.has(decision.status)) {
        return pending(WAITING, decision.session_url ?? null);
      }
      // "In Review", or a status this code doesn't know yet: wait, don't decide.
      return pending(REVIEWING, null);
    },
  };
}
