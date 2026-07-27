import "server-only";
import { buildJobSchema, type CreateDeploymentInput } from "@multivrs/client";
import { generateApiToken, hashApiToken, tokenHint } from "@/lib/api/api-token";
import { prisma } from "@/lib/prisma";
import { deploymentEnvironment } from "@/lib/services/environment-variable.service";
import {
  issueProjectOidcToken,
  oidcConfigured,
} from "@/lib/services/oidc.service";

interface CloudBuildDispatch {
  apiUrl: string;
  deploymentId: string;
  input: CreateDeploymentInput;
  projectId: string;
  userId: string;
}

function requireBuildWorkerConfig() {
  const url = process.env.CLOUDFLARE_BUILD_WORKER_URL;
  const token = process.env.CLOUDFLARE_BUILD_WORKER_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Cloud builds are not configured. Set CLOUDFLARE_BUILD_WORKER_URL and CLOUDFLARE_BUILD_WORKER_TOKEN.",
    );
  }
  return { token, url };
}

export function cloudBuildConfigured() {
  return Boolean(
    process.env.CLOUDFLARE_BUILD_WORKER_URL &&
      process.env.CLOUDFLARE_BUILD_WORKER_TOKEN,
  );
}

export async function dispatchCloudBuild({
  apiUrl,
  deploymentId,
  input,
  projectId,
  userId,
}: CloudBuildDispatch) {
  const config = requireBuildWorkerConfig();
  const [project, githubAccount, projectEnvironment] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { framework: true },
    }),
    prisma.account.findFirst({
      where: { userId, providerId: "github" },
      select: { accessToken: true, accessTokenExpiresAt: true },
    }),
    deploymentEnvironment(projectId, input.target),
  ]);
  if (!project) throw new Error("Project not found for cloud build.");
  const oidc = oidcConfigured()
    ? await issueProjectOidcToken(userId, projectId, "multivrs-build")
    : undefined;

  const apiToken = generateApiToken();
  const tokenRecord = await prisma.apiToken.create({
    data: {
      userId,
      name: `Cloud build token for ${deploymentId}`,
      tokenHash: hashApiToken(apiToken),
      tokenHint: tokenHint(apiToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1_000),
    },
    select: { id: true },
  });

  const repositoryToken =
    githubAccount?.accessToken &&
    (!githubAccount.accessTokenExpiresAt ||
      githubAccount.accessTokenExpiresAt > new Date())
      ? githubAccount.accessToken
      : undefined;
  const job = buildJobSchema.parse({
    apiUrl,
    apiToken,
    deploymentId,
    framework: project.framework,
    input: {
      ...input,
      env: {
        ...projectEnvironment,
        ...input.env,
        ...(oidc ? { MULTIVRS_OIDC_TOKEN: oidc.token } : {}),
      },
    },
    projectId,
    repositoryToken,
  });

  try {
    const response = await fetch(new URL("/jobs", config.url), {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(job),
    });
    if (!response.ok) {
      throw new Error(`Cloudflare build worker returned ${response.status}`);
    }
  } catch (error) {
    await prisma.apiToken
      .delete({ where: { id: tokenRecord.id } })
      .catch(() => undefined);
    const message =
      error instanceof Error ? error.message : "Cloud build dispatch failed";
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "error", errorMessage: message, finishedAt: new Date() },
    });
    throw error;
  }
}
