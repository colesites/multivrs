/**
 * Translate a thrown error into a JSON-serializable HTTP response shape.
 * Unknown (non-Multivrs) errors collapse to a generic 500 so we never leak
 * internals to the client.
 */
import { MultivrsError } from "./errors";

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ErrorResponse {
  status: number;
  body: ErrorResponseBody;
}

export function isMultivrsError(err: unknown): err is MultivrsError {
  return err instanceof MultivrsError;
}

export function toErrorResponse(err: unknown): ErrorResponse {
  if (isMultivrsError(err)) {
    return {
      status: err.statusCode,
      body: {
        error: { code: err.code, message: err.message, details: err.details },
      },
    };
  }
  return {
    status: 500,
    body: { error: { code: "internal_error", message: "Internal server error" } },
  };
}
