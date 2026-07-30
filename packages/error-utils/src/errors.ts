/**
 * Typed platform errors for the Multivrs control plane and tooling.
 *
 * Every error carries a stable machine-readable `code` and the HTTP
 * `statusCode` it maps to, so API routes and the CLI can translate a thrown
 * error into a response without a big switch statement.
 */

export type ErrorCode =
  | "validation_error"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "compute_not_configured"
  | "configuration_error"
  | "internal_error";

export class MultivrsError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends MultivrsError {
  constructor(message = "Validation failed", details?: unknown) {
    super("validation_error", message, 422, details);
  }
}

export class UnauthorizedError extends MultivrsError {
  constructor(message = "Authentication required", details?: unknown) {
    super("unauthorized", message, 401, details);
  }
}

export class ForbiddenError extends MultivrsError {
  constructor(message = "Access denied", details?: unknown) {
    super("forbidden", message, 403, details);
  }
}

export class NotFoundError extends MultivrsError {
  constructor(message = "Resource not found", details?: unknown) {
    super("not_found", message, 404, details);
  }
}

export class ConflictError extends MultivrsError {
  constructor(message = "Resource already exists", details?: unknown) {
    super("conflict", message, 409, details);
  }
}

export class ComputeNotConfiguredError extends MultivrsError {
  constructor(message = "Deployment compute is not configured", details?: unknown) {
    super("compute_not_configured", message, 501, details);
  }
}

export class ConfigurationError extends MultivrsError {
  constructor(message = "Service is not configured", details?: unknown) {
    super("configuration_error", message, 503, details);
  }
}
