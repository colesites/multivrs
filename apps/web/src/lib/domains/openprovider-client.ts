import "server-only";
import { z } from "zod";

const LOGIN_PATH = "/v1beta/auth/login";
const TOKEN_TTL_MS = 10 * 60_000;
const loginSchema = z.object({ data: z.object({ token: z.string().min(1) }) });
const errorSchema = z.object({
  code: z.number().optional(),
  desc: z.string().optional(),
  message: z.string().optional(),
});

export interface OpenproviderConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export class OpenproviderApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
  ) {
    super(message);
    this.name = "OpenproviderApiError";
  }
}

let tokenCache: { expiresAt: number; token: string } | null = null;
let tokenRequest: Promise<string> | null = null;

export function getOpenproviderConfig(): OpenproviderConfig | null {
  const username = process.env.OPENPROVIDER_USERNAME?.trim();
  const password = process.env.OPENPROVIDER_PASSWORD?.trim();
  if (!username || !password) return null;
  return {
    baseUrl: (
      process.env.OPENPROVIDER_API_URL ?? "https://api.openprovider.eu"
    ).replace(/\/$/, ""),
    username,
    password,
  };
}

export function isOpenproviderSandbox(): boolean {
  if (isLocalOpenproviderSandbox()) return true;
  const config = getOpenproviderConfig();
  if (!config) return false;
  try {
    return new URL(config.baseUrl).hostname === "api.sandbox.openprovider.nl";
  } catch {
    return false;
  }
}

export function isLocalOpenproviderSandbox(): boolean {
  return process.env.OPENPROVIDER_SANDBOX_DRIVER?.trim() === "local";
}

export async function getOpenproviderToken(
  config: OpenproviderConfig,
): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  if (tokenRequest) return tokenRequest;
  tokenRequest = requestToken(config);
  try {
    const token = await tokenRequest;
    tokenCache = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  } finally {
    tokenRequest = null;
  }
}

export async function openproviderFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const config = getOpenproviderConfig();
  if (!config)
    throw new OpenproviderApiError("Provider is not configured", 503);
  const token = await getOpenproviderToken(config);
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
    cache: init.cache ?? "no-store",
  });
  if (!response.ok) throw await toProviderError(response);
  return response;
}

async function requestToken(config: OpenproviderConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}${LOGIN_PATH}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
      ip: "0.0.0.0",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw await toProviderError(response);
  return loginSchema.parse(await response.json()).data.token;
}

async function toProviderError(
  response: Response,
): Promise<OpenproviderApiError> {
  const payload = errorSchema.safeParse(
    await response.json().catch(() => null),
  );
  const description = payload.success
    ? (payload.data.desc ?? payload.data.message ?? "Request failed")
    : "Request failed";
  const code = payload.success ? payload.data.code : undefined;
  const suffix = code === undefined ? "" : ` (code ${code})`;
  return new OpenproviderApiError(
    `Openprovider: ${description}${suffix}`,
    response.status,
    code,
  );
}
