import type { Scope } from "./types";

/** Calls to the API's /dashboard routes with the session cookie. */

export class SignedOut extends Error {}

export interface ApiError {
  code: string;
  message: string;
  param?: string;
}

function errorOf(data: unknown): ApiError {
  if (typeof data === "object" && data !== null && "error" in data) {
    const { error } = data;
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      const code = "code" in error ? String(error.code) : "unknown";
      const param =
        "param" in error && typeof error.param === "string"
          ? error.param
          : undefined;
      return { code, message: error.message, param };
    }
  }
  return { code: "unknown", message: "Request failed." };
}

/** Headers that pick the business and mode; the API checks the user belongs to it. */
function scopeHeaders(scope: Scope): Record<string, string> {
  return {
    "VRS-Mode": scope.mode,
    ...(scope.merchant ? { "VRS-Merchant": scope.merchant } : {}),
  };
}

export async function dashboardFetch<T>(
  apiUrl: string,
  path: string,
  scope: Scope,
  init: { method?: string; body?: object } = {},
): Promise<T> {
  const res = await fetch(`${apiUrl}/dashboard${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    credentials: "include",
    headers: {
      ...scopeHeaders(scope),
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  if (res.status === 401) throw new SignedOut();
  const data: unknown = await res.json();
  if (!res.ok) {
    const error = errorOf(data);
    throw Object.assign(new Error(error.message), {
      code: error.code,
      param: error.param,
    });
  }
  // The API's response shapes are mirrored in ./types.ts.
  return data as T;
}

export async function signOut(apiUrl: string): Promise<void> {
  await fetch(`${apiUrl}/auth/sign-out`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => undefined);
  window.location.assign("/sign-in");
}
