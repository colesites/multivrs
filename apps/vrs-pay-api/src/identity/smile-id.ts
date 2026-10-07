import { createHmac, randomUUID } from "node:crypto";
import type { IdentityCheck, IdentityResult } from "./identity.types";
import { identityCheckUnavailable, idTypeNotSupported } from "./identity-errors";
import { SmileIdResponseSchema, smileIdOutcome } from "./smile-id-result";

export const SMILE_ID_SERVERS = {
  sandbox: "https://testapi.smileidentity.com/v1",
  production: "https://api.smileidentity.com/v1",
} as const;
export type SmileIdServer = keyof typeof SMILE_ID_SERVERS;

/** Enhanced KYC: look the number up at the issuing authority and get the name on record. */
const ENHANCED_KYC_JOB_TYPE = 5;
const TIMEOUT_MS = 30_000;
const PROVIDER = "smile_id";

/** Our ID types → Smile ID's, by country. Anything not listed goes to the document check. */
const SMILE_ID_TYPES: Record<string, Record<string, string>> = {
  NG: { bvn: "BVN", nin: "NIN_V2" },
  GH: { ghana_card: "GHANA_CARD", passport: "PASSPORT" },
  KE: { national_id: "NATIONAL_ID", passport: "PASSPORT" },
  ZA: { national_id: "NATIONAL_ID" },
};

export function smileIdTypeFor(country: string, idType: string): string | undefined {
  return SMILE_ID_TYPES[country]?.[idType];
}

/** Base64 HMAC-SHA256 of timestamp + partner id + "sid_request", keyed with the API key. */
export function smileIdSignature(partnerId: string, apiKey: string, timestamp: string): string {
  return createHmac("sha256", apiKey)
    .update(timestamp)
    .update(partnerId)
    .update("sid_request")
    .digest("base64");
}

export interface SmileIdConfig {
  partnerId: string;
  apiKey: string;
  server: SmileIdServer;
  /** Defaults to the global fetch; tests pass a fake. */
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}

export interface SmileIdVerifier {
  supports(country: string, idType: string): boolean;
  verify(check: IdentityCheck): Promise<IdentityResult>;
}

/** Instant ID lookups at the issuer (BVN, NIN, Ghana Card, …) through Smile ID's Enhanced KYC. */
export function createSmileIdVerifier(config: SmileIdConfig): SmileIdVerifier {
  const send = config.fetch ?? ((url: string, init: RequestInit) => fetch(url, init));
  const url = `${SMILE_ID_SERVERS[config.server]}/id_verification`;

  async function lookup(check: IdentityCheck, idType: string): Promise<unknown> {
    const timestamp = new Date().toISOString();
    const body = {
      partner_id: config.partnerId,
      timestamp,
      signature: smileIdSignature(config.partnerId, config.apiKey, timestamp),
      source_sdk: "rest_api",
      source_sdk_version: "1.0.0",
      partner_params: {
        job_id: randomUUID(),
        user_id: check.merchantId,
        job_type: ENHANCED_KYC_JOB_TYPE,
      },
      country: check.country,
      id_type: idType,
      id_number: check.idNumber,
      first_name: check.firstName,
      last_name: check.lastName,
      dob: check.dateOfBirth,
    };
    let response: Response;
    try {
      response = await send(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      throw identityCheckUnavailable(PROVIDER, error instanceof Error ? error.message : "network");
    }
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw identityCheckUnavailable(PROVIDER, `HTTP ${response.status} ${text.slice(0, 200)}`);
    }
    return response.json().catch(() => null);
  }

  return {
    supports: (country, idType) => smileIdTypeFor(country, idType) !== undefined,
    async verify(check) {
      const idType = smileIdTypeFor(check.country, check.idType);
      if (!idType) throw idTypeNotSupported();
      const parsed = SmileIdResponseSchema.safeParse(await lookup(check, idType));
      if (!parsed.success) throw identityCheckUnavailable(PROVIDER, "unexpected response");
      const outcome = smileIdOutcome(parsed.data, check);
      if (outcome.status === "unavailable")
        throw identityCheckUnavailable(PROVIDER, outcome.detail);
      return outcome;
    },
  };
}
