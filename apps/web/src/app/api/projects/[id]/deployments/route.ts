/**
 * Control-plane API: /api/projects/[id]/deployments
 *   GET  → list a project's deployments (newest first)
 *   POST → queue a new deployment
 */
import { createDeploymentInputSchema } from "@multivrs/client";
import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  createDeployment,
  listDeployments,
} from "@/lib/services/deployment.service";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    return ok(await listDeployments(userId, id));
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const input = await parseBody(req, createDeploymentInputSchema);
    return ok(await createDeployment(userId, id, input), 201);
  } catch (err) {
    return fail(err);
  }
}
