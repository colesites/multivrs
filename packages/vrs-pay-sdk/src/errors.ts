/** An error the VRS Pay API returned, with its stable `type` and `code`. */
export class VrsPayError extends Error {
  readonly type: string;
  readonly code: string;
  readonly status: number;
  readonly param: string | null;
  readonly requestId: string | null;

  constructor(init: {
    type: string;
    code: string;
    message: string;
    status: number;
    param?: string | null;
    requestId?: string | null;
  }) {
    super(init.message);
    this.name = "VrsPayError";
    this.type = init.type;
    this.code = init.code;
    this.status = init.status;
    this.param = init.param ?? null;
    this.requestId = init.requestId ?? null;
  }
}

interface ErrorBody {
  error?: {
    type?: string;
    code?: string;
    message?: string;
    param?: string | null;
    request_id?: string | null;
  };
}

function isErrorBody(value: unknown): value is ErrorBody {
  return typeof value === "object" && value !== null && "error" in value;
}

/** The API's `{ error: … }` body as a VrsPayError, or a generic one for anything else. */
export function errorFromResponse(status: number, body: unknown): VrsPayError {
  const error = isErrorBody(body) ? body.error : undefined;
  return new VrsPayError({
    type: error?.type ?? "api_error",
    code: error?.code ?? "unexpected_response",
    message: error?.message ?? `VRS Pay answered ${status}.`,
    status,
    param: error?.param ?? null,
    requestId: error?.request_id ?? null,
  });
}
