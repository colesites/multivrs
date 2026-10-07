/** POST /api/team/adopt — make an empty workspace you own your account's team. */
import type { NextRequest } from "next/server";
import { z } from "zod";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { adoptWorkspaceAsTeam } from "@/lib/services/account-team.service";

const adoptSchema = z.object({ organizationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { organizationId } = await parseBody(req, adoptSchema);
    return ok(await adoptWorkspaceAsTeam(userId, organizationId));
  } catch (error) {
    return fail(error);
  }
}
