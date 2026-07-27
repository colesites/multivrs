import {
  CONDITION_OPS,
  CONDITION_TYPES,
  FIREWALL_ACTIONS,
} from "@multivrs/firewall";
import { z } from "zod";

export const createFirewallRuleSchema = z.object({
  action: z.enum(FIREWALL_ACTIONS),
  conditions: z
    .array(
      z.object({
        key: z.string().trim().min(1).optional(),
        op: z.enum(CONDITION_OPS),
        type: z.enum(CONDITION_TYPES),
        value: z.union([
          z.string().trim().min(1),
          z.array(z.string().trim().min(1)).min(1),
        ]),
      }),
    )
    .min(1),
  enabled: z.boolean().default(true),
  name: z.string().trim().min(2).max(80),
});

export const updateFirewallRuleSchema = z.object({
  enabled: z.boolean(),
});
