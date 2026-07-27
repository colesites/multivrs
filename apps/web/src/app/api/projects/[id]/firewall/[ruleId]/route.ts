import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateFirewallRuleSchema } from "@/lib/schemas/firewall-rule.schemas";
import {
  deleteFirewallRule,
  setFirewallRuleEnabled,
} from "@/lib/services/firewall-rule.service";

interface RouteParams {
  params: Promise<{ id: string; ruleId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, ruleId } = await params;
    const input = await parseBody(request, updateFirewallRuleSchema);
    await setFirewallRuleEnabled(userId, id, ruleId, input.enabled);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id, ruleId } = await params;
    await deleteFirewallRule(userId, id, ruleId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
