/**
 * Control-plane API: /api/projects
 *   GET  → list the authenticated user's projects
 *   POST → create a project
 */
import { createProjectInputSchema } from "@multivrs/client";
import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createProject, listProjects } from "@/lib/services/project.service";


export async function GET() {
  try {
    const userId = await requireUserId();
    return ok(await listProjects(userId));
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(req, createProjectInputSchema);
    return ok(await createProject(userId, input), 201);
  } catch (err) {
    return fail(err);
  }
}
