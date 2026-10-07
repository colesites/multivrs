/** An error the VRS Pay API returned, with its stable `code`. */
export class VrsPayError extends Error {
  readonly type: string;
  readonly code: string;
  readonly status: number;

  constructor(type: string, code: string, message: string, status: number) {
    super(message);
    this.name = "VrsPayError";
    this.type = type;
    this.code = code;
    this.status = status;
  }
}

interface ErrorBody {
  error?: { type?: string; code?: string; message?: string };
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === "object" && value !== null && "error" in value;
}

export function errorFromResponse(status: number, body: unknown): VrsPayError {
  const error = isErrorBody(body) ? body.error : undefined;
  return new VrsPayError(
    error?.type ?? "api_error",
    error?.code ?? "unexpected_response",
    error?.message ?? `VRS Pay answered ${status}.`,
    status,
  );
}
