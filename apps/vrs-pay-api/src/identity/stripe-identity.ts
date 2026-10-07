import type Stripe from "stripe";
import type { IdentityResult, IdentityVerifier, PersonDetails } from "./identity.types";
import { identityCheckUnavailable } from "./identity-errors";
import { DOB_MISMATCH, NAME_MISMATCH, namesMatch } from "./name-match";

/** Stripe metadata key tying a verification session to its merchant. */
export const IDENTITY_MERCHANT_METADATA_KEY = "vrs_merchant_id";

type Session = Stripe.Identity.VerificationSession;
type LastError = Stripe.Identity.VerificationSession.LastError;
type VerifiedOutputs = Stripe.Identity.VerificationSession.VerifiedOutputs;
type DocumentType = Stripe.Identity.VerificationSessionCreateParams.Options.Document.AllowedType;

/** The slice of the Stripe SDK this uses; a real `Stripe` instance satisfies it. */
export interface StripeIdentityApi {
  identity: {
    verificationSessions: {
      create(params: Stripe.Identity.VerificationSessionCreateParams): Promise<Session>;
      retrieve(
        id: string,
        params?: Stripe.Identity.VerificationSessionRetrieveParams,
      ): Promise<Session>;
    };
  };
}

const ANY_DOCUMENT: DocumentType[] = ["passport", "id_card", "driving_license"];
/** The document to scan for each ID type; numbers without a card (BVN, SSN) take any photo ID. */
const DOCUMENTS: Record<string, DocumentType[]> = {
  passport: ["passport"],
  national_id: ["id_card"],
  ghana_card: ["id_card"],
  nin: ["id_card"],
  driving_licence: ["driving_license"],
};

const WAITING = "Finish the check: scan your ID and take a selfie.";
const REVIEWING = "We're checking your document. This usually takes a few minutes.";
const ERRORS: Partial<Record<NonNullable<LastError["code"]>, string>> = {
  abandoned: "The check wasn't finished. Verify again to restart it.",
  consent_declined: "You declined the check. Verify again to restart it.",
  document_expired: "This document has expired. Use a current one.",
  document_type_not_supported: "That document isn't accepted for this ID type.",
  id_number_mismatch: "The ID number doesn't match your name and date of birth.",
  selfie_face_mismatch: "The selfie doesn't match the photo on your ID.",
  under_supported_age: "You must be at least 18.",
};

function failure(error: LastError | null): IdentityResult {
  const reason =
    (error?.code ? ERRORS[error.code] : undefined) ??
    error?.reason ??
    "We couldn't verify your document. Try again with a clear photo.";
  return { status: "failed", reason };
}

function isoDob(dob: VerifiedOutputs["dob"]): string | null {
  if (!dob?.year || !dob.month || !dob.day) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dob.year}-${pad(dob.month)}-${pad(dob.day)}`;
}

/** Stripe read the document; it still has to be the person the merchant said they are. */
function matchOutputs(outputs: VerifiedOutputs | null | undefined, person: PersonDetails) {
  if (!outputs || !namesMatch([outputs.first_name, outputs.last_name], person)) {
    return { status: "failed", reason: NAME_MISMATCH } as const;
  }
  if (isoDob(outputs.dob) !== person.dateOfBirth) {
    return { status: "failed", reason: DOB_MISMATCH } as const;
  }
  return { status: "verified" } as const;
}

async function call<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw identityCheckUnavailable("stripe_identity", error instanceof Error ? error.message : "");
  }
}

/**
 * For IDs no registry lookup covers: the merchant scans the document and
 * takes a live selfie on Stripe's page; Stripe matches the two.
 */
export function createDocumentVerifier(config: {
  api: StripeIdentityApi;
  /** Where Stripe sends the merchant back to (the setup page). */
  returnUrl: string;
}): Required<IdentityVerifier> {
  const sessions = config.api.identity.verificationSessions;
  return {
    async verify(check) {
      const session = await call(() =>
        sessions.create({
          type: "document",
          client_reference_id: check.merchantId,
          metadata: { [IDENTITY_MERCHANT_METADATA_KEY]: check.merchantId },
          return_url: config.returnUrl,
          options: {
            document: {
              allowed_types: DOCUMENTS[check.idType] ?? ANY_DOCUMENT,
              require_id_number: check.idType === "ssn",
              require_live_capture: true,
              require_matching_selfie: true,
            },
          },
        }),
      );
      return { status: "pending", reason: WAITING, session: { id: session.id, url: session.url } };
    },
    async resume(sessionId, person) {
      const session = await call(() =>
        sessions.retrieve(sessionId, { expand: ["verified_outputs", "verified_outputs.dob"] }),
      );
      const pending = (reason: string, url: string | null): IdentityResult => ({
        status: "pending",
        reason,
        session: { id: session.id, url },
      });
      switch (session.status) {
        case "verified":
          return matchOutputs(session.verified_outputs, person);
        case "processing":
          return pending(REVIEWING, null);
        case "requires_input":
          return session.last_error ? failure(session.last_error) : pending(WAITING, session.url);
        default:
          return failure({ code: "abandoned", reason: null });
      }
    },
  };
}
