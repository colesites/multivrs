import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CreateDeploymentInput } from "@multivrs/client";
import { generateApiToken, hashApiToken, tokenHint } from "@/lib/api/api-token";
import { prisma } from "@/lib/prisma";
import {
  assertReadableDirectory,
  resolveCliRunner,
  resolveWorkingDirectory,
  runCommand,
} from "@/lib/services/deployment-runner-command";
import { appendRunnerLog } from "@/lib/services/deployment-runner-log.service";
import { deploymentEnvironment } from "@/lib/services/environment-variable.service";
import {
  issueProjectOidcToken,
  oidcConfigured,
} from "@/lib/services/oidc.service";

interface BackgroundDeploymentOptions {
  apiUrl: string;
  input: CreateDeploymentInput;
}
export async function runBackgroundDeployment(
  userId: string,
  projectId: string,
  deploymentId: string,
  options: BackgroundDeploymentOptions,
) {
  await executeDeployment(userId, projectId, deploymentId, options);
}
async function executeDeployment(
  userId: string,
  projectId: string,
  deploymentId: string,
  { apiUrl, input }: BackgroundDeploymentOptions,
) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "multivrs-runner-"));
  const checkoutDirectory = join(tempDirectory, "project");
  let temporaryTokenId: string | undefined;

  try {
    if (!input.repoUrl) {
      throw new Error("A repository URL is required for a remote build.");
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { framework: true },
    });
    if (!project) {
      throw new Error("Project not found for deployment.");
    }
    const projectEnvironment = await deploymentEnvironment(
      projectId,
      input.target,
    );
    const oidc = oidcConfigured()
      ? await issueProjectOidcToken(userId, projectId, "multivrs-build")
      : undefined;

    const rawToken = generateApiToken();
    const tokenRecord = await prisma.apiToken.create({
      data: {
        userId,
        name: `Build token for ${deploymentId}`,
        tokenHash: hashApiToken(rawToken),
        tokenHint: tokenHint(rawToken),
        expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
      },
      select: { id: true },
    });
    temporaryTokenId = tokenRecord.id;

    await appendRunnerLog(deploymentId, "Cloning repository");
    await runCommand(
      "git",
      ["clone", "--depth", "1", input.repoUrl, "project"],
      tempDirectory,
    );

    const workingDirectory = resolveWorkingDirectory(
      checkoutDirectory,
      input.rootDirectory,
    );
    await assertReadableDirectory(workingDirectory);

    await mkdir(join(workingDirectory, ".multivrs"), { recursive: true });
    await writeFile(
      join(workingDirectory, ".multivrs", "project.json"),
      JSON.stringify({ project_id: projectId }),
    );

    const runner = await resolveCliRunner();
    await appendRunnerLog(
      deploymentId,
      `Starting ${project.framework ?? "auto-detected"} production build`,
    );

    await runCommand(runner.command, runner.args, workingDirectory, {
      ...projectEnvironment,
      ...input.env,
      ...(oidc ? { MULTIVRS_OIDC_TOKEN: oidc.token } : {}),
      MULTIVRS_API_URL: apiUrl,
      MULTIVRS_TOKEN: rawToken,
      MULTIVRS_DEPLOYMENT_ID: deploymentId,
      MULTIVRS_BUN_BINARY:
        process.env.MULTIVRS_BUN_BINARY ??
        (process.versions.bun ? process.execPath : "bun"),
      ...(project.framework ? { MULTIVRS_FRAMEWORK: project.framework } : {}),
      ...(input.buildCommand
        ? { MULTIVRS_BUILD_COMMAND: input.buildCommand }
        : {}),
      ...(input.installCommand
        ? { MULTIVRS_INSTALL_COMMAND: input.installCommand }
        : {}),
      ...(input.outputDirectory
        ? { MULTIVRS_OUTPUT_DIRECTORY: input.outputDirectory }
        : {}),
      ...runner.env,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown deployment error";
    try {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: "error",
          errorMessage: message,
          finishedAt: new Date(),
        },
      });
      await prisma.deploymentLog.create({
        data: {
          deploymentId,
          level: "error",
          message: message.slice(0, 20_000),
        },
      });
    } catch {}
  } finally {
    if (temporaryTokenId) {
      await prisma.apiToken
        .delete({ where: { id: temporaryTokenId } })
        .catch(() => undefined);
    }
    await rm(tempDirectory, { recursive: true, force: true }).catch(
      () => undefined,
    );
  }
}
