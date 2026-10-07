/** Calls to the API's /auth routes (Better Auth), with the session cookie. */

export type AuthResult =
  | { ok: true; data: unknown }
  | { ok: false; message: string };

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match.",
  USER_ALREADY_EXISTS:
    "There's already an account with this email. Sign in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "There's already an account with this email. Sign in instead.",
  PASSWORD_TOO_SHORT: "Use at least 8 characters for your password.",
  INVALID_EMAIL: "Enter a valid email address.",
};

function messageOf(data: unknown, status: number): string {
  if (typeof data === "object" && data !== null) {
    const code = "code" in data ? String(data.code) : "";
    if (MESSAGES[code]) return MESSAGES[code];
    if ("message" in data && typeof data.message === "string")
      return data.message;
  }
  return status === 429
    ? "Too many attempts. Wait a minute and try again."
    : "Something went wrong. Try again.";
}

export async function authRequest(
  apiUrl: string,
  path: string,
  body?: object,
): Promise<AuthResult> {
  try {
    const res = await fetch(`${apiUrl}/auth${path}`, {
      method: body ? "POST" : "GET",
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data: unknown = await res.json().catch(() => null);
    return res.ok
      ? { ok: true, data }
      : { ok: false, message: messageOf(data, res.status) };
  } catch {
    return {
      ok: false,
      message: "Can't reach VRS Pay. Check your connection and try again.",
    };
  }
}

/** True when the browser already has a live session. */
export async function hasSession(apiUrl: string): Promise<boolean> {
  const result = await authRequest(apiUrl, "/get-session");
  return (
    result.ok &&
    typeof result.data === "object" &&
    result.data !== null &&
    "session" in result.data
  );
}

/** Starts GitHub/Google sign-in; the browser leaves for the provider. */
export async function socialSignIn(
  apiUrl: string,
  provider: string,
): Promise<string | null> {
  const origin = window.location.origin;
  const result = await authRequest(apiUrl, "/sign-in/social", {
    provider,
    callbackURL: `${origin}/dashboard`,
    errorCallbackURL: `${origin}/sign-in`,
  });
  if (!result.ok) return result.message;
  const { data } = result;
  if (
    typeof data === "object" &&
    data !== null &&
    "url" in data &&
    typeof data.url === "string"
  ) {
    window.location.assign(data.url);
    return null;
  }
  return "Couldn't start sign-in. Try again.";
}
