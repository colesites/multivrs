import { evaluateFirewall, verifyFirewallBypassToken } from "@multivrs/firewall";
import type { ControlResolution } from "./control";
import type { Env } from "./types";

function blocked(message: string, status: number, ruleId?: string): Response {
  return Response.json(
    { error: message, ruleId },
    { headers: { "cache-control": "private, no-store", "x-multivrs-firewall": "blocked" }, status },
  );
}

export async function enforceFirewall(
  request: Request,
  env: Env,
  deployment: ControlResolution,
): Promise<Response | null> {
  const url = new URL(request.url);
  const bypass = request.headers.get("x-multivrs-firewall-bypass");
  if (
    bypass &&
    env.FIREWALL_BYPASS_SECRET &&
    (await verifyFirewallBypassToken(bypass, env.FIREWALL_BYPASS_SECRET, {
      path: url.pathname,
      projectId: deployment.projectId,
    }))
  ) {
    return null;
  }
  const decision = evaluateFirewall(deployment.firewallRules, {
    country: typeof request.cf?.country === "string" ? request.cf.country : undefined,
    headers: Object.fromEntries(request.headers),
    ip: request.headers.get("cf-connecting-ip") ?? undefined,
    method: request.method,
    path: url.pathname,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });
  if (decision.action === "allow") {
    if (!deployment.attackMode) return null;
    return blocked("This project is currently in attack mode", 403);
  }
  if (decision.action === "deny") return blocked("Request blocked", 403, decision.ruleId);
  if (decision.action === "challenge") {
    return blocked("Request requires a security challenge", 403, decision.ruleId);
  }
  if (!env.RATE_LIMITER) return blocked("Rate limit reached", 429, decision.ruleId);
  const actor =
    request.headers.get("authorization") ?? request.headers.get("cf-connecting-ip") ?? "anonymous";
  const outcome = await env.RATE_LIMITER.limit({
    key: `${deployment.projectId}:${decision.ruleId ?? "rule"}:${actor}`,
  });
  return outcome.success ? null : blocked("Rate limit reached", 429, decision.ruleId);
}
