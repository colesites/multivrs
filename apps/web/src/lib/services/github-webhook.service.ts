import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { CreateDeploymentInput } from "@multivrs/client";
import { ConfigurationError, UnauthorizedError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";
import {
  githubPullRequestSchema,
  githubPushSchema,
} from "@/lib/schemas/github-webhook.schemas";
import {
  cloudBuildConfigured,
  dispatchCloudBuild,
} from "@/lib/services/cloud-build-dispatch.service";
import { createDeployment } from "@/lib/services/deployment.service";

interface GitHubBuildEvent {
  branch: string;
  commitSha: string;
  fullName: string;
  target: "preview" | "production";
}

export function verifyGitHubWebhook(
  body: string,
  signature: string | null,
): void {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret)
    throw new ConfigurationError(
      "GitHub deployment webhooks are not configured",
    );
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  if (
    !signature ||
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw new UnauthorizedError("Invalid GitHub webhook signature");
  }
}

export async function processGitHubDeploymentWebhook(input: {
  apiUrl: string;
  body: unknown;
  deliveryId: string;
  event: string;
}): Promise<{ deployments: number; duplicate: boolean }> {
  if (!cloudBuildConfigured())
    throw new ConfigurationError("Cloud builds are not configured");
  const buildEvent = parseEvent(input.event, input.body);
  if (!buildEvent) return { deployments: 0, duplicate: false };
  const claimed = await prisma.deploymentWebhookEvent.createMany({
    data: [{ event: input.event, id: input.deliveryId, provider: "github" }],
    skipDuplicates: true,
  });
  if (!claimed.count) return { deployments: 0, duplicate: true };
  const repoUrl = `https://github.com/${buildEvent.fullName}`;
  const projects = await prisma.project.findMany({
    where: { repositoryUrl: { in: [repoUrl, `${repoUrl}.git`] } },
    select: { id: true, ownerId: true },
  });
  await Promise.all(
    projects.map(async (project) => {
      const buildInput: CreateDeploymentInput = {
        branch: buildEvent.branch,
        commitSha: buildEvent.commitSha,
        repoUrl,
        target: buildEvent.target,
      };
      const deployment = await createDeployment(
        project.ownerId,
        project.id,
        buildInput,
      );
      await dispatchCloudBuild({
        apiUrl: input.apiUrl,
        deploymentId: deployment.id,
        input: buildInput,
        projectId: project.id,
        userId: project.ownerId,
      });
    }),
  );
  return { deployments: projects.length, duplicate: false };
}

function parseEvent(event: string, body: unknown): GitHubBuildEvent | null {
  if (event === "push") {
    const parsed = githubPushSchema.parse(body);
    const branch = parsed.ref.slice("refs/heads/".length);
    return {
      branch,
      commitSha: parsed.after,
      fullName: parsed.repository.full_name,
      target:
        branch === parsed.repository.default_branch ? "production" : "preview",
    };
  }
  if (event !== "pull_request") return null;
  const parsed = githubPullRequestSchema.safeParse(body);
  if (!parsed.success) return null;
  return {
    branch: parsed.data.pull_request.head.ref,
    commitSha: parsed.data.pull_request.head.sha,
    fullName: parsed.data.repository.full_name,
    target: "preview",
  };
}
