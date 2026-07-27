import { type BuildJob, buildJobSchema } from "@multivrs/client";
import { hasValidWorkerToken } from "./auth";
import { executeBuild } from "./build";
import { BuildCommandError, type BuildWorkerEnv } from "./build-worker.types";
import { appendBuildLog, markBuildFailed, revokeBuildToken } from "./control-plane";
import { handleSandboxRequest } from "./sandboxes";

export { Sandbox } from "@cloudflare/sandbox";

async function enqueue(request: Request, env: BuildWorkerEnv) {
  if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = buildJobSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid build job", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  await env.BUILD_QUEUE.send(parsed.data, { contentType: "json" });
  return Response.json({ accepted: true, deploymentId: parsed.data.deploymentId }, { status: 202 });
}

async function consume(message: Message<BuildJob>, env: BuildWorkerEnv) {
  const parsed = buildJobSchema.safeParse(message.body);
  if (!parsed.success) {
    message.ack();
    return;
  }
  const job = parsed.data;
  try {
    await executeBuild(job, env);
    await revokeBuildToken(job);
    message.ack();
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Build failed";
    if (!(error instanceof BuildCommandError) && message.attempts < 3) {
      await appendBuildLog(job, "warn", "Build infrastructure interrupted; retrying").catch(
        () => undefined,
      );
      message.retry({ delaySeconds: 30 * message.attempts });
      return;
    }
    await appendBuildLog(job, "error", messageText).catch(() => undefined);
    await markBuildFailed(job, messageText).catch(() => undefined);
    await revokeBuildToken(job).catch(() => undefined);
    message.ack();
  }
}

export default {
  async fetch(request: Request, env: BuildWorkerEnv) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "multivrs-build" });
    }
    if (request.method === "POST" && url.pathname === "/jobs") {
      return enqueue(request, env);
    }
    if (url.pathname.startsWith("/sandboxes")) {
      if (!hasValidWorkerToken(request, env.BUILD_WORKER_TOKEN)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      return (
        (await handleSandboxRequest(request, env, url.pathname)) ??
        new Response("Not found", { status: 404 })
      );
    }
    return new Response("Not found", { status: 404 });
  },
  async queue(batch: MessageBatch<BuildJob>, env: BuildWorkerEnv) {
    await Promise.all(batch.messages.map((message) => consume(message, env)));
  },
} satisfies ExportedHandler<BuildWorkerEnv, BuildJob>;
