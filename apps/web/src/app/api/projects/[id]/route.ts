/**
 * Control-plane API: /api/projects/[id]
 *   GET → fetch a single project the user owns
 */
import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { getProject } from "@/lib/services/project.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return ok(await getProject(userId, id));
  } catch (err) {
    return fail(err);
  }
}
