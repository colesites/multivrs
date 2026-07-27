import { type ExecEvent, parseSSEStream, type Sandbox } from "@cloudflare/sandbox";
import type { BuildJob } from "@multivrs/client";
import { BuildCommandError } from "./build-worker.types";
import { appendBuildLog } from "./control-plane";

interface StreamBuildOptions {
  cwd: string;
  env: Record<string, string | undefined>;
  timeout: number;
}

export async function streamBuildCommand(
  sandbox: Sandbox,
  job: BuildJob,
  options: StreamBuildOptions,
) {
  const stream = await sandbox.execStream("multivrs deploy --prod", options);
  let buffered = "";
  let exitCode: number | undefined;
  let streamError: string | undefined;
  let lastFlush = Date.now();

  const flush = async (level: "info" | "warn" = "info") => {
    const message = buffered.trim();
    buffered = "";
    lastFlush = Date.now();
    if (message) await appendBuildLog(job, level, message);
  };

  for await (const event of parseSSEStream<ExecEvent>(stream)) {
    if (event.type === "stdout" || event.type === "stderr") {
      buffered += event.data ?? "";
      if (buffered.length >= 4_000 || Date.now() - lastFlush >= 2_000) {
        await flush(event.type === "stderr" ? "warn" : "info");
      }
    } else if (event.type === "complete") {
      exitCode = event.exitCode;
    } else if (event.type === "error") {
      streamError = event.error ?? "Build stream failed";
    }
  }
  await flush(exitCode === 0 ? "info" : "warn");
  if (streamError || exitCode !== 0) {
    throw new BuildCommandError(streamError ?? `Build exited with code ${exitCode ?? "unknown"}.`);
  }
}
