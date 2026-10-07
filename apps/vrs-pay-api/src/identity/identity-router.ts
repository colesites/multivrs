import { isVrsPayError } from "@vrs-pay/core";
import { platformStripeKey } from "../deps/stripe-modes";
import { createStripeClient } from "../providers/stripe/stripe-client";
import { createDiditLookup, type RegistryVerifier } from "./didit";
import { createDiditDocumentVerifier } from "./didit-session";
import type { IdentityVerifier } from "./identity.types";
import { idTypeNotSupported } from "./identity-errors";
import { createDocumentVerifier } from "./stripe-identity";
import { sandboxVerifier } from "./verifiers";

type Env = Record<string, string | undefined>;
type DocumentVerifier = Required<IdentityVerifier>;

/** Stripe Identity session ids; every other session id is Didit's. */
const STRIPE_SESSION_PREFIX = "vs_";

export interface IdentityProviders {
  /** Instant registry lookups for the ID types they support. */
  registry?: RegistryVerifier;
  /** The document and selfie check. */
  didit?: DocumentVerifier;
  /** The backup document check: used when Didit isn't set up or doesn't answer. */
  stripe?: DocumentVerifier;
}

const unavailable = (error: unknown) =>
  isVrsPayError(error) && error.code === "identity_check_unavailable";

/**
 * Registry lookups for the IDs they cover; a document and selfie check for
 * the rest, on Didit, or on Stripe Identity when Didit is down or not set up.
 */
export function routeIdentity({
  registry,
  didit,
  stripe,
}: IdentityProviders): IdentityVerifier | undefined {
  const documents = [didit, stripe].filter((d): d is DocumentVerifier => d !== undefined);
  const [first] = documents;
  if (!registry && !first) return undefined;
  return {
    async verify(check) {
      if (registry?.supports(check.country, check.idType)) return registry.verify(check);
      for (const [index, verifier] of documents.entries()) {
        try {
          return await verifier.verify(check);
        } catch (error) {
          if (index === documents.length - 1 || !unavailable(error)) throw error;
        }
      }
      throw idTypeNotSupported();
    },
    resume: first
      ? (sessionId, person) => {
          const owner = sessionId.startsWith(STRIPE_SESSION_PREFIX) ? stripe : didit;
          return (owner ?? first).resume(sessionId, person);
        }
      : undefined,
  };
}
/**
 * The ID checks this server runs, for test and live mode alike: one check
 * covers the whole account, so a passing check is what opens live payments.
 *
 * - Didit (DIDIT_API_KEY + DIDIT_WORKFLOW_ID) runs the document and selfie
 *   check. It accepts Nigeria's NIN slip and card, passports, driver's
 *   licences and voter's cards, and 500 checks a month are free.
 * - Stripe Identity, on the platform's live Stripe key, is the backup when
 *   Didit isn't set up or doesn't answer.
 * - DIDIT_NIN_LOOKUP=on adds Didit's paid instant NIN lookup, for merchants
 *   with a NIN number but no slip or card.
 *
 * Servers with a database only use real providers. Without one (local dev)
 * and with no provider at all, any well-formed number passes.
 */
export function identityFromEnv(
  env: Env,
  options: { database: boolean; returnUrl: string },
): IdentityVerifier | undefined {
  const apiKey = env.DIDIT_API_KEY;
  const ninLookup = env.DIDIT_NIN_LOOKUP === "on";
  if (apiKey && !env.DIDIT_WORKFLOW_ID && !ninLookup) {
    throw new Error("DIDIT_API_KEY is set: add DIDIT_WORKFLOW_ID for Didit's document check.");
  }
  if (ninLookup && !apiKey) throw new Error("DIDIT_NIN_LOOKUP=on needs DIDIT_API_KEY.");
  const didit =
    apiKey && env.DIDIT_WORKFLOW_ID
      ? createDiditDocumentVerifier({
          apiKey,
          apiUrl: env.DIDIT_API_URL,
          workflowId: env.DIDIT_WORKFLOW_ID,
          returnUrl: options.returnUrl,
          allowSandbox: !options.database,
        })
      : undefined;
  const registry =
    apiKey && ninLookup ? createDiditLookup({ apiKey, apiUrl: env.DIDIT_API_URL }) : undefined;
  const stripeKey = platformStripeKey(env, "live");
  const stripe = stripeKey
    ? createDocumentVerifier({ api: createStripeClient(stripeKey), returnUrl: options.returnUrl })
    : undefined;
  return (
    routeIdentity({ registry, didit, stripe }) ?? (options.database ? undefined : sandboxVerifier)
  );
}
