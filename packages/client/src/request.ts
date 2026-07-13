/**
 * Low-level HTTP helper for the typed client. Validates every response against
 * a zod schema and turns non-2xx responses (which carry the platform's
 * `{ error: { code, message } }` body) into a typed `ApiError`.
 */
import { z } from "zod";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const errorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/**
 * Structural fetch type — the subset we use. Avoids depending on the full
 * `typeof fetch` (which also requires `fetch.preconnect`), so a plain function
 * or a test double satisfies it. `globalThis.fetch` is assignable to it.
 */
export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface RequestContext {
  baseUrl: string;
  token?: string;
  fetch: FetchLike;
}

export async function request<T>(
  ctx: RequestContext,
  method: string,
  path: string,
  schema: z.ZodType<T>,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (ctx.token) {
    headers.authorization = `Bearer ${ctx.token}`;
  }

  const res = await ctx.fetch(`${ctx.baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const parsed = errorBodySchema.safeParse(json);
    if (parsed.success) {
      throw new ApiError(
        parsed.data.error.code,
        parsed.data.error.message,
        res.status,
        parsed.data.error.details,
      );
    }
    throw new ApiError("internal_error", `Request failed (${res.status})`, res.status);
  }

  return schema.parse(json);
}
