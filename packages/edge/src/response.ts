/**
 * Edge middleware primitives. Middleware returns a runtime-agnostic `EdgeResult`
 * descriptor (not a `Response`), so the same middleware runs on any runtime
 * (bun/node/edge) and is trivially unit-testable; the proxy/runtime turns the
 * descriptor into a real `Response`.
 */
export type EdgeResultType = "next" | "rewrite" | "redirect" | "json";

export interface EdgeResult {
  type: EdgeResultType;
  /** Target for rewrite/redirect. */
  url?: string;
  /** Status for redirect/json. */
  status?: number;
  /** Body for json. */
  body?: unknown;
  headers?: Record<string, string>;
}

/** Continue to the origin/route handler, optionally adding headers. */
export function next(headers?: Record<string, string>): EdgeResult {
  return { type: "next", headers };
}

/** Internally serve a different path without changing the URL. */
export function rewrite(url: string, headers?: Record<string, string>): EdgeResult {
  return { type: "rewrite", url, headers };
}

/** Send the client to a new URL (default 307 temporary). */
export function redirect(url: string, status = 307, headers?: Record<string, string>): EdgeResult {
  return { type: "redirect", url, status, headers };
}

/** Respond directly with JSON. */
export function json(body: unknown, status = 200, headers?: Record<string, string>): EdgeResult {
  return { type: "json", body, status, headers };
}
