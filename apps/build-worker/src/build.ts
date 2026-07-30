import { getSandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog, recordBuildUsage } from "./control-plane";
import { restoreRemoteCache, saveRemoteCache } from "./remote-cache";
import { publishRuntime } from "./runtime-publish";
import { streamBuildCommand } from "./stream-build";

const WORKSPACE = "/workspace/project";
const BUILD_TIMEOUT_MS = 45 * 60 * 1_000;

function checkoutUrl(job: BuildJob) {
  if (!job.repositoryToken) return job.input.repoUrl;
  const url = new URL(job.input.repoUrl);
  url.username = "x-access-token";
  url.password = job.repositoryToken;
  return url.toString();
}

function workingDirectory(rootDirectory?: string) {
  const root = rootDirectory?.trim() || ".";
  const segments = root.split("/").filter((segment) => segment && segment !== ".");
  if (root.startsWith("/") || segments.includes("..")) {
    throw new BuildCommandError("Root directory must stay inside the repository.");
  }
  return segments.length ? `${WORKSPACE}/${segments.join("/")}` : WORKSPACE;
}

function commandEnvironment(job: BuildJob) {
  return {
    ...job.input.env,
    MULTIVRS_API_URL: job.apiUrl,
    MULTIVRS_TOKEN: job.apiToken,
    MULTIVRS_DEPLOYMENT_ID: job.deploymentId,
    MULTIVRS_BUN_BINARY: "/root/.bun/bin/bun",
    ...(job.framework ? { MULTIVRS_FRAMEWORK: job.framework } : {}),
    ...(job.input.buildCommand ? { MULTIVRS_BUILD_COMMAND: job.input.buildCommand } : {}),
    ...(job.input.installCommand ? { MULTIVRS_INSTALL_COMMAND: job.input.installCommand } : {}),
    ...(job.input.outputDirectory ? { MULTIVRS_OUTPUT_DIRECTORY: job.input.outputDirectory } : {}),
  };
}

export async function executeBuild(job: BuildJob, env: BuildWorkerEnv) {
  const startedAt = Date.now();
  const sandbox = getSandbox(env.Sandbox, `deployment-${job.deploymentId}`, {
    sleepAfter: "10m",
  });
  try {
    await appendBuildLog(job, "info", "Cloudflare build sandbox starting");
    await sandbox.gitCheckout(checkoutUrl(job), {
      branch: job.input.branch,
      depth: 1,
      targetDir: WORKSPACE,
    });
    if (job.repositoryToken) {
      await sandbox.exec("git remote remove origin", { cwd: WORKSPACE });
    }
    const cwd = workingDirectory(job.input.rootDirectory);
    await sandbox.mkdir(`${cwd}/.multivrs`, { recursive: true });
    await sandbox.writeFile(
      `${cwd}/.multivrs/project.json`,
      JSON.stringify({ project_id: job.projectId }),
    );
    const restoredBytes = await restoreRemoteCache(sandbox, job, env, cwd);
    if (restoredBytes > 0) {
      await Promise.all([
        appendBuildLog(job, "info", "Restored Multivrs remote build cache"),
        recordBuildUsage(job, "build_cache_read_bytes", restoredBytes),
      ]);
    }
    await streamBuildCommand(sandbox, job, {
      cwd,
      env: commandEnvironment(job),
      timeout: BUILD_TIMEOUT_MS,
    });
    const savedBytes = await saveRemoteCache(sandbox, job, env, cwd);
    if (savedBytes > 0) {
      await Promise.all([
        appendBuildLog(job, "info", "Published Multivrs remote build cache"),
        recordBuildUsage(job, "build_cache_write_bytes", savedBytes),
      ]);
    }
    await publishRuntime(sandbox, job, env, cwd);
  } finally {
    await recordBuildUsage(job, "build_duration_ms_standard", Date.now() - startedAt).catch(
      () => undefined,
    );
    await sandbox.destroy();
  }
}
