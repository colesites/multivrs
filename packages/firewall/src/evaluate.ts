/**
 * Evaluate firewall rules against a request. Returns the first matching rule's
 * action (rules are AND-of-conditions); defaults to `allow` when nothing matches.
 */
import type { FirewallAction, FirewallCondition, FirewallRule } from "./schema";

export interface FirewallRequest {
  ip?: string;
  path: string;
  method: string;
  country?: string;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface FirewallDecision {
  action: FirewallAction;
  ruleId?: string;
}

interface NormalizedRequest extends FirewallRequest {
  headers: Record<string, string>;
}

function normalize(req: FirewallRequest): NormalizedRequest {
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers ?? {})) {
    headers[key.toLowerCase()] = value;
  }
  return { ...req, headers };
}

function fieldValue(req: NormalizedRequest, condition: FirewallCondition): string | undefined {
  switch (condition.type) {
    case "ip":
      return req.ip;
    case "path":
      return req.path;
    case "method":
      return req.method;
    case "country":
      return req.country;
    case "user_agent":
      return req.userAgent;
    case "header":
      return condition.key ? req.headers[condition.key.toLowerCase()] : undefined;
    default:
      return undefined;
  }
}

function matchOp(
  actual: string | undefined,
  op: FirewallCondition["op"],
  value: string | string[],
): boolean {
  if (actual === undefined) {
    return false;
  }
  const values = Array.isArray(value) ? value : [value];
  switch (op) {
    case "eq":
      return actual === values[0];
    case "neq":
      return actual !== values[0];
    case "contains":
      return values.some((v) => actual.includes(v));
    case "starts_with":
      return values.some((v) => actual.startsWith(v));
    case "regex":
      return values.some((v) => new RegExp(v).test(actual));
    case "in":
      return values.includes(actual);
    default:
      return false;
  }
}

export function evaluateFirewall(
  rules: FirewallRule[],
  request: FirewallRequest,
): FirewallDecision {
  const req = normalize(request);
  for (const rule of rules) {
    if (rule.enabled === false) {
      continue;
    }
    const matches = rule.conditions.every((c) => matchOp(fieldValue(req, c), c.op, c.value));
    if (matches) {
      return { action: rule.action, ruleId: rule.id };
    }
  }
  return { action: "allow" };
}
