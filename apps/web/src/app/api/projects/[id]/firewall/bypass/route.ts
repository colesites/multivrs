import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createFirewallBypassSchema } from "@/lib/schemas/firewall-bypass.schemas";
import { issueFirewallBypass } from "@/lib/services/firewall-bypass.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, createFirewallBypassSchema);
    return ok(
      await issueFirewallBypass(
        await requireUserId(),
        (await params).id,
        input,
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
