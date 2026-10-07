/**
 * VRS Pay API errors. Every error carries a stable `type` + `code`, the HTTP
 * `status` it maps to, and optionally the request `param` at fault, so the API
 * can render `{ error: { type, code, message, param } }` without a switch.
 */

export type ErrorType =
  | "invalid_request_error"
  | "authentication_error"
  | "idempotency_error"
  | "provider_error"
  | "card_error"
  | "api_error";

export interface VrsPayErrorInit {
  type: ErrorType;
  code: string;
  message: string;
  status: number;
  param?: string;
  details?: Record<string, unknown>;
}

export class VrsPayError extends Error {
  readonly type: ErrorType;
  readonly code: string;
  readonly status: number;
  readonly param?: string;
  readonly details?: Record<string, unknown>;

  constructor(init: VrsPayErrorInit) {
    super(init.message);
    this.name = "VrsPayError";
    this.type = init.type;
    this.code = init.code;
    this.status = init.status;
    this.param = init.param;
    this.details = init.details;
  }
}

export function isVrsPayError(value: unknown): value is VrsPayError {
  return value instanceof VrsPayError;
}

export function invalidRequest(code: string, message: string, param?: string): VrsPayError {
  return new VrsPayError({
    type: "invalid_request_error",
    code,
    message,
    status: 400,
    param,
  });
}

export function authenticationError(message: string): VrsPayError {
  return new VrsPayError({
    type: "authentication_error",
    code: "invalid_api_key",
    message,
    status: 401,
  });
}

export function idempotencyError(code: string, message: string): VrsPayError {
  return new VrsPayError({ type: "idempotency_error", code, message, status: 409 });
}

/** A provider adapter exists in the routing table but isn't wired up yet. */
export function providerNotImplemented(provider: string, operation: string): VrsPayError {
  return new VrsPayError({
    type: "provider_error",
    code: "provider_not_implemented",
    message: `The ${provider} adapter does not implement ${operation} yet.`,
    status: 501,
    details: { provider, operation },
  });
}

/** A merchant-scoped resource that doesn't exist (or isn't theirs). */
export function resourceMissing(resource: string, id: string): VrsPayError {
  return new VrsPayError({
    type: "invalid_request_error",
    code: "resource_missing",
    message: `No such ${resource}: '${id}'.`,
    status: 404,
    param: "id",
  });
}

/**
 * A provider rejected or failed a call; `message` is safe to show the
 * merchant. `retryable` marks network/outage failures where the provider
 * may still have acted on the request.
 */
export function providerRequestFailed(
  provider: string,
  operation: string,
  message: string,
  retryable = false,
): VrsPayError {
  return new VrsPayError({
    type: "provider_error",
    code: "provider_request_failed",
    message: `${provider} ${operation} failed: ${message}`,
    status: 502,
    details: { provider, operation, retryable },
  });
}

/** The customer's card was declined or needs them to authenticate (402). */
export function cardError(
  code: "card_declined" | "authentication_required",
  message: string,
): VrsPayError {
  return new VrsPayError({ type: "card_error", code, message, status: 402 });
}
