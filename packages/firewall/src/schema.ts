/**
 * Firewall (WAF) rule schema — the control-plane representation. Rules are an
 * ordered list; the first rule whose conditions ALL match decides the action.
 * Enforcement (rate-limit counting, challenge issuance) is the data-plane's job
 * (Go/Cloudflare, later) — this package owns the schema + the decision logic.
 */
import { ValidationError } from "@multivrs/error-utils";
import { z } from "zod";

export const FIREWALL_ACTIONS = ["allow", "deny", "challenge", "rate_limit"] as const;
export type FirewallAction = (typeof FIREWALL_ACTIONS)[number];

export const CONDITION_TYPES = ["ip", "path", "method", "country", "user_agent", "header"] as const;

export const CONDITION_OPS = ["eq", "neq", "contains", "starts_with", "regex", "in"] as const;

export const conditionSchema = z.object({
  type: z.enum(CONDITION_TYPES),
  op: z.enum(CONDITION_OPS),
  value: z.union([z.string(), z.array(z.string())]),
  /** Header name (required when `type` is "header"). */
  key: z.string().optional(),
});
export type FirewallCondition = z.infer<typeof conditionSchema>;

export const firewallRuleSchema = z.object({
  id: z.string(),
  action: z.enum(FIREWALL_ACTIONS),
  /** AND-ed together; the rule matches only if every condition matches. */
  conditions: z.array(conditionSchema).min(1),
  enabled: z.boolean().optional(),
  description: z.string().optional(),
});
export type FirewallRule = z.infer<typeof firewallRuleSchema>;

export const firewallRulesSchema = z.array(firewallRuleSchema);

export function parseFirewallRules(input: unknown): FirewallRule[] {
  const result = firewallRulesSchema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Invalid firewall rules", result.error.issues);
  }
  return result.data;
}
