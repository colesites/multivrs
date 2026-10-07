import { platformStripeKey } from "../deps/stripe-modes";
import { createStripeClient } from "../providers/stripe/stripe-client";
import { createDiditVerifier, type RegistryVerifier } from "./didit";
import type { IdentityVerifier } from "./identity.types";
import { idTypeNotSupported } from "./identity-errors";
import { createDocumentVerifier } from "./stripe-identity";
import { sandboxVerifier } from "./verifiers";

type Env = Record<string, string | undefined>;

export interface IdentityProviders {
  registry?: RegistryVerifier;
  documents?: Required<IdentityVerifier>;
}

/** Registry lookups for the IDs they cover; a document and selfie check for the rest. */
export function routeIdentity({
  registry,
  documents,
}: IdentityProviders): IdentityVerifier | undefined {
  if (!registry && !documents) return undefined;
  return {
    async verify(check) {
      if (registry?.supports(check.country, check.idType)) return registry.verify(check);
      if (documents) return documents.verify(check);
      throw idTypeNotSupported();
    },
    resume: documents?.resume,
  };
}

/**
 * The ID checks this server runs, for test and live mode alike: one check
 * covers the whole account, so a passing check is what opens live payments.
 *
 * - Stripe Identity checks a document and selfie, on the platform's live
 *   Stripe key. It covers every country.
 * - Didit (DIDIT_API_KEY) looks up Nigerian NINs at the registry, so
 *   merchants with only a NIN number, no card, can verify.
 *
 * Servers with a database only use real providers. Without one (local dev)
 * and with no provider at all, any well-formed number passes.
 */
export function identityFromEnv(
  env: Env,
  options: { database: boolean; returnUrl: string },
): IdentityVerifier | undefined {
  const registry = env.DIDIT_API_KEY
    ? createDiditVerifier({ apiKey: env.DIDIT_API_KEY, apiUrl: env.DIDIT_API_URL })
    : undefined;
  const stripeKey = platformStripeKey(env, "live");
  const documents = stripeKey
    ? createDocumentVerifier({ api: createStripeClient(stripeKey), returnUrl: options.returnUrl })
    : undefined;
  return routeIdentity({ registry, documents }) ?? (options.database ? undefined : sandboxVerifier);
}
