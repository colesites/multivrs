import { identityCheckUnavailable } from "./identity-errors";

export const DIDIT_API_URL = "https://verification.didit.me";

const PROVIDER = "didit";
const TIMEOUT_MS = 30_000;

export interface DiditConfig {
  apiKey: string;
  apiUrl?: string;
  /** Defaults to the global fetch; tests pass a fake. */
  fetch?: (url: string, init: RequestInit) => Promise<Response>;
}

/** Didit didn't answer usefully; nothing was decided, so retrying is safe. */
export function diditUnavailable(detail: string) {
  return identityCheckUnavailable(PROVIDER, detail);
}

/**
 * One call to Didit's API with the API key. A JSON `body` is sent as JSON,
 * a FormData one as a form. Network failures and error statuses become
 * `identity_check_unavailable`.
 */
export async function diditRequest(
  config: DiditConfig,
  path: string,
  body?: FormData | Record<string, unknown>,
): Promise<unknown> {
  const send = config.fetch ?? ((url: string, init: RequestInit) => fetch(url, init));
  const base = (config.apiUrl ?? DIDIT_API_URL).replace(/\/+$/, "");
  const form = body instanceof FormData;
  let response: Response;
  try {
    response = await send(`${base}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "x-api-key": config.apiKey,
        ...(body === undefined || form ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : form ? body : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw diditUnavailable(error instanceof Error ? error.message : "network");
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw diditUnavailable(`HTTP ${response.status} ${text.slice(0, 200)}`);
  }
  return response.json().catch(() => null);
}
