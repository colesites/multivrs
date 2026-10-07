import { platformStripeKey } from "../deps/stripe-modes";
import { createStripeClient } from "../providers/stripe/stripe-client";
import type { IdentityVerifier } from "./identity.types";
import { idTypeNotSupported } from "./identity-errors";
import { createSmileIdVerifier, type SmileIdServer, type SmileIdVerifier } from "./smile-id";
import { createDocumentVerifier } from "./stripe-identity";
import { sandboxVerifier } from "./verifiers";

type Env = Record<string, string | undefined>;

export interface IdentityProviders {
  smileId?: SmileIdVerifier;
  documents?: Required<IdentityVerifier>;
}

/** Smile ID for IDs it can look up at the issuer; a document and selfie check for the rest. */
export function routeIdentity({
  smileId,
  documents,
}: IdentityProviders): IdentityVerifier | undefined {
  if (!smileId && !documents) return undefined;
  return {
    async verify(check) {
      if (smileId?.supports(check.country, check.idType)) return smileId.verify(check);
      if (documents) return documents.verify(check);
      throw idTypeNotSupported();
    },
    resume: documents?.resume,
  };
}

function smileIdServer(value: string | undefined): SmileIdServer {
  if (!value || value === "production") return "production";
  if (value === "sandbox") return "sandbox";
  throw new Error("SMILE_ID_ENV must be production or sandbox.");
}

/**
 * The ID checks this server runs, for test and live mode alike: one check
 * covers the whole account, so a passing check is what opens live payments.
 *
 * - Smile ID (SMILE_ID_PARTNER_ID + SMILE_ID_API_KEY) looks up BVN, NIN,
 *   Ghana Card, Kenyan and South African IDs at the issuer.
 * - Stripe Identity checks a document and selfie for everything else, on
 *   the platform's live Stripe key.
 *
 * With a database every check is real, since a sandbox pass would unlock
 * live payments. Without one (local dev) Smile ID's sandbox is allowed, and
 * with no provider at all any well-formed number passes.
 */
export function identityFromEnv(
  env: Env,
  options: { database: boolean; returnUrl: string },
): IdentityVerifier | undefined {
  const server = smileIdServer(env.SMILE_ID_ENV);
  if (server === "sandbox" && options.database) {
    throw new Error("SMILE_ID_ENV=sandbox only works without a database: it would unlock live.");
  }
  const smileId =
    env.SMILE_ID_PARTNER_ID && env.SMILE_ID_API_KEY
      ? createSmileIdVerifier({
          partnerId: env.SMILE_ID_PARTNER_ID,
          apiKey: env.SMILE_ID_API_KEY,
          server,
        })
      : undefined;
  const stripeKey = platformStripeKey(env, "live");
  const documents = stripeKey
    ? createDocumentVerifier({ api: createStripeClient(stripeKey), returnUrl: options.returnUrl })
    : undefined;
  return routeIdentity({ smileId, documents }) ?? (options.database ? undefined : sandboxVerifier);
}
