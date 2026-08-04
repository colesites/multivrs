import "server-only";
import { type FirewallCondition, firewallRuleSchema } from "@multivrs/firewall";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { DashboardFirewallRule } from "@/features/dashboard/types/firewall-rule.types";
import { prisma } from "@/lib/prisma";
import type { createFirewallRuleSchema } from "@/lib/schemas/firewall-rule.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { getProject } from "@/lib/services/project.service";

type CreateFirewallRuleInput = z.infer<typeof createFirewallRuleSchema>;

function conditionsJson(
  conditions: FirewallCondition[],
): Prisma.InputJsonArray {
  return conditions.map((condition) => ({
    ...(condition.key ? { key: condition.key } : {}),
    op: condition.op,
    type: condition.type,
    value: condition.value,
  }));
}

function toRule(row: {
  id: string;
  name: string;
  action: string;
  conditions: Prisma.JsonValue;
  enabled: boolean;
  priority: number;
  updatedAt: Date;
}): DashboardFirewallRule {
  const parsed = firewallRuleSchema.parse({
    action: row.action,
    conditions: row.conditions,
    enabled: row.enabled,
    id: row.id,
  });
  return {
    action: parsed.action,
    conditions: parsed.conditions,
    enabled: row.enabled,
    id: row.id,
    name: row.name,
    priority: row.priority,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFirewallRules(
  userId: string,
  projectId: string,
): Promise<DashboardFirewallRule[]> {
  await getProject(userId, projectId);
  const rows = await prisma.firewallRule.findMany({
    where: { projectId },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toRule);
}

export async function createFirewallRule(
  userId: string,
  projectId: string,
  input: CreateFirewallRuleInput,
): Promise<DashboardFirewallRule> {
  await getProject(userId, projectId, "update");
  const current = await prisma.firewallRule.count({ where: { projectId } });
  await assertResourceAvailable({
    current,
    projectId,
    resource: "firewall_rules",
    userId,
  });
  const highest = await prisma.firewallRule.aggregate({
    where: { projectId },
    _max: { priority: true },
  });
  const row = await prisma.firewallRule.create({
    data: {
      action: input.action,
      conditions: conditionsJson(input.conditions),
      enabled: input.enabled,
      name: input.name,
      priority: (highest._max.priority ?? -1) + 1,
      projectId,
    },
  });
  return toRule(row);
}

export async function setFirewallRuleEnabled(
  userId: string,
  projectId: string,
  id: string,
  enabled: boolean,
): Promise<void> {
  await getProject(userId, projectId, "update");
  await prisma.firewallRule.updateMany({
    where: { id, projectId },
    data: { enabled },
  });
}

export async function deleteFirewallRule(
  userId: string,
  projectId: string,
  id: string,
): Promise<void> {
  await getProject(userId, projectId, "update");
  await prisma.firewallRule.deleteMany({ where: { id, projectId } });
}
