/**
 * Control-plane API: /api/projects/[id]/deployments
 *   GET  → list a project's deployments (newest first)
 *   POST → queue a new deployment
 */
import { createDeploymentInputSchema } from "@multivrs/client";
import type { NextRequest } from "next/server";
import { after } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { prisma } from "@/lib/prisma";
import { runBackgroundDeployment } from "@/lib/services/build-runner";
import {
  cloudBuildConfigured,
  dispatchCloudBuild,
} from "@/lib/services/cloud-build-dispatch.service";
import {
  createDeployment,
  listDeployments,
} from "@/lib/services/deployment.service";

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

    const deployment = await createDeployment(userId, id, input);

    if (input.repoUrl) {
      const apiUrl = new URL(req.url).origin;
      if (cloudBuildConfigured()) {
        await dispatchCloudBuild({
          apiUrl,
          deploymentId: deployment.id,
          input,
          projectId: id,
          userId,
        });
      } else if (process.env.NODE_ENV !== "production") {
        after(() =>
          runBackgroundDeployment(userId, id, deployment.id, { apiUrl, input }),
        );
      } else {
        const message =
          "Production builds require the Cloudflare build worker configuration.";
        await Promise.all([
          prisma.deployment.update({
            where: { id: deployment.id },
            data: {
              status: "error",
              errorMessage: message,
              finishedAt: new Date(),
            },
          }),
          prisma.deploymentLog.create({
            data: { deploymentId: deployment.id, level: "error", message },
          }),
        ]);
        throw new Error(message);
      }
    }

    return ok(deployment, 201);
  } catch (err) {
    return fail(err);
  }
}
