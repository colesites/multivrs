/**
 * Control-plane API: /api/projects/[id]
 *   GET → fetch a single project the user owns
 */
import { updateProjectInputSchema } from "@multivrs/client";
import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  deleteProject,
  getProject,
  updateProject,
} from "@/lib/services/project.service";

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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return ok(
      await updateProject(
        userId,
        id,
        await parseBody(request, updateProjectInputSchema),
      ),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteProject(userId, id);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
