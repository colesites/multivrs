import { getSandbox } from "@cloudflare/sandbox";
import { z } from "zod";
import type { BuildWorkerEnv } from "./build-worker.types";

const sandboxIdSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,126}$/);
const createSchema = z.object({ sandboxId: sandboxIdSchema });
const commandSchema = z.object({
  command: z.string().min(1).max(4_000),
  cwd: z.string().startsWith("/workspace").max(500).default("/workspace"),
});

export async function handleSandboxRequest(
  request: Request,
  env: BuildWorkerEnv,
  pathname: string,
): Promise<Response | null> {
  if (pathname === "/sandboxes" && request.method === "POST") {
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return invalid(parsed.error.issues);
    const sandbox = getSandbox(env.Sandbox, parsed.data.sandboxId, { sleepAfter: "10m" });
    const result = await sandbox.exec("pwd", { cwd: "/workspace", timeout: 30_000 });
    if (!result.success)
      return Response.json({ error: result.stderr || "Sandbox failed to start" }, { status: 502 });
    return Response.json({ sandboxId: parsed.data.sandboxId, status: "ready" }, { status: 201 });
  }
  const id = sandboxIdSchema.safeParse(pathname.match(/^\/sandboxes\/([^/]+)$/)?.[1]);
  if (!id.success) return null;
  const sandbox = getSandbox(env.Sandbox, id.data, { sleepAfter: "10m" });
  if (request.method === "DELETE") {
    await sandbox.destroy();
    return Response.json({ deleted: true });
  }
  if (request.method === "POST") {
    const command = commandSchema.safeParse(await request.json());
    if (!command.success) return invalid(command.error.issues);
    const result = await sandbox.exec(command.data.command, {
      cwd: command.data.cwd,
      timeout: 5 * 60_000,
    });
    return Response.json({
      exitCode: result.exitCode,
      stderr: result.stderr,
      stdout: result.stdout,
      success: result.success,
    });
  }
  return new Response("Method not allowed", { status: 405 });
}

function invalid(issues: z.core.$ZodIssue[]) {
  return Response.json({ error: "Invalid sandbox request", issues }, { status: 400 });
}
