import type { Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog } from "./control-plane";

const SAFE_NAME = /^[a-z0-9][a-z0-9-_]{0,62}$/;

function requireRuntimeEnvironment(env: BuildWorkerEnv) {
  const namespace = env.DISPATCH_NAMESPACE;
  if (
    !env.CLOUDFLARE_API_TOKEN ||
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !namespace ||
    !SAFE_NAME.test(namespace)
  ) {
    throw new BuildCommandError(
      "Cloudflare runtime publishing is not configured for production builds.",
    );
  }
  return namespace;
}

function nextWranglerConfig(name: string, variables: Record<string, string>) {
  return {
    name,
    main: "../.open-next/worker.js",
    compatibility_date: "2026-07-26",
    compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"],
    assets: { directory: "../.open-next/assets", binding: "ASSETS" },
    observability: { enabled: true },
    vars: variables,
  };
}

export async function publishRuntime(
  sandbox: Sandbox,
  job: BuildJob,
  env: BuildWorkerEnv,
  cwd: string,
) {
  const nextOutput = await sandbox.exec("test -f .open-next/worker.js", { cwd });
  if (job.framework !== "nextjs" && !nextOutput.success) return;
  const namespace = requireRuntimeEnvironment(env);
  if (!SAFE_NAME.test(job.deploymentId)) {
    throw new BuildCommandError("Deployment ID cannot be used as a Worker name.");
  }
  const configPath = `${cwd}/.multivrs/runtime-wrangler.jsonc`;
  await sandbox.writeFile(
    configPath,
    JSON.stringify(nextWranglerConfig(job.deploymentId, job.input.env ?? {})),
  );
  await appendBuildLog(job, "info", "Publishing full Next.js runtime to Cloudflare");
  const result = await sandbox.exec(
    `bunx wrangler deploy --config ${configPath} --name ${job.deploymentId} --dispatch-namespace ${namespace}`,
    {
      cwd,
      timeout: 10 * 60 * 1_000,
      env: {
        CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
      },
    },
  );
  if (!result.success) {
    throw new BuildCommandError(result.stderr || "Cloudflare runtime publish failed.");
  }
  await appendBuildLog(job, "info", "Cloudflare runtime published");
}
