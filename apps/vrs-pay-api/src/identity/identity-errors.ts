import { VrsPayError } from "@vrs-pay/core";

/** Live servers need an ID provider: there's no manual review to fall back on. */
export function identityNotConfigured(): VrsPayError {
  return new VrsPayError({
    type: "api_error",
    code: "identity_unavailable",
    message: "ID checks aren't set up on this server yet.",
    status: 503,
  });
}

/** The provider or the issuing registry didn't answer; nothing was decided, so retrying is safe. */
export function identityCheckUnavailable(provider: string, detail: string): VrsPayError {
  return new VrsPayError({
    type: "provider_error",
    code: "identity_check_unavailable",
    message: "We couldn't reach the ID registry just now. Try again in a few minutes.",
    status: 503,
    details: { provider, detail },
  });
}

/** This ID type can't be checked automatically on this server. */
export function idTypeNotSupported(): VrsPayError {
  return new VrsPayError({
    type: "invalid_request_error",
    code: "id_type_unsupported",
    message: "We can't check this ID type yet. Choose another ID.",
    status: 400,
    param: "id_type",
  });
}

/** The merchant started too many ID checks lately; each one can cost money at the provider. */
export function tooManyIdentityChecks(retryInSeconds: number): VrsPayError {
  const hours = Math.max(1, Math.ceil(retryInSeconds / 3600));
  return new VrsPayError({
    type: "invalid_request_error",
    code: "too_many_identity_checks",
    message: `You've started the most ID checks allowed for today. Try again in ${hours} ${hours === 1 ? "hour" : "hours"}.`,
    status: 429,
    details: { retry_in_seconds: retryInSeconds },
  });
}
