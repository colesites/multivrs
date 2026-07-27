import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createFirewallRuleSchema } from "@/lib/schemas/firewall-rule.schemas";
import {
  createFirewallRule,
  listFirewallRules,
} from "@/lib/services/firewall-rule.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    return ok(await listFirewallRules(userId, (await params).id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, createFirewallRuleSchema);
    return ok(await createFirewallRule(userId, (await params).id, input), 201);
  } catch (error) {
    return fail(error);
  }
}
