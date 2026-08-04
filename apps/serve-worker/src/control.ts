import type { Env } from "./types";

export interface ControlResolution {
  analyticsEnabled: boolean;
  attackMode: boolean;
  browserTtl: number;
  cacheMode: "aggressive" | "bypass" | "smart";
  deploymentId: string;
  artifactHash: string;
  firewallRules: Array<{
    action: "allow" | "deny" | "challenge" | "rate_limit";
    conditions: Array<{
      key?: string;
      op: "eq" | "neq" | "contains" | "starts_with" | "regex" | "in";
      type: "ip" | "path" | "method" | "country" | "user_agent" | "header";
      value: string | string[];
    }>;
    enabled?: boolean;
    id: string;
  }>;
  projectId: string;
  runtimeEnvironment: Record<string, string>;
  edgeTtl: number;
  speedInsightsEnabled: boolean;
  cacheVersion: string;
  defaultRevalidate: number;
  runtimeConfigVersion: string;
  staleWindow: number;
  billingBlocked: boolean;
  billingBlockReason: string | null;
}

export function encodeRuntimeEnvironment(values: Record<string, string>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(values));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function resolveDeployment(request: Request, env: Env): Promise<ControlResolution> {
  const endpoint = new URL("/api/serve/resolve", env.CONTROL_PLANE_URL);
  endpoint.searchParams.set("hostname", new URL(request.url).hostname);
  const headers = new Headers();
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  const response = await fetch(endpoint, { headers });
  if (!response.ok) {
    throw new Error(`control plane returned ${response.status}`);
  }
  return response.json<ControlResolution>();
}

export async function resolveProjectDeployment(
  projectId: string,
  env: Env,
): Promise<ControlResolution> {
  const endpoint = new URL("/api/serve/resolve", env.CONTROL_PLANE_URL);
  endpoint.searchParams.set("projectId", projectId);
  const headers = new Headers();
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  const response = await fetch(endpoint, { headers });
  if (!response.ok) throw new Error(`control plane returned ${response.status}`);
  return response.json<ControlResolution>();
}
