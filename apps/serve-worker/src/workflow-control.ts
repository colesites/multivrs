import { type PlatformWorkflowPayload, platformWorkflowPayloadSchema } from "./platform-workflow";
import type { Env } from "./types";

const CONTROL_PATH = "/_multivrs/control/workflows";

export async function handleWorkflowControl(request: Request, env: Env): Promise<Response | null> {
  if (new URL(request.url).pathname !== CONTROL_PATH) return null;
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!env.WORKFLOW_CONTROL_SECRET) {
    return new Response("Workflow control is not configured", { status: 503 });
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !constantTimeEqual(token, env.WORKFLOW_CONTROL_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const parsed = platformWorkflowPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid workflow payload" }, { status: 422 });
  try {
    const instance = await env.WORKFLOWS.create({ id: parsed.data.runId, params: parsed.data });
    return Response.json({ id: instance.id }, { status: 202 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Workflow dispatch failed" },
      { status: 502 },
    );
  }
}

export async function dispatchScheduledWorkflows(env: Env): Promise<void> {
  const endpoint = new URL("/api/workflows/internal/due", env.CONTROL_PLANE_URL);
  const headers = new Headers({ "content-type": "application/json" });
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  const response = await fetch(endpoint, { method: "POST", headers, body: "{}" });
  if (!response.ok) throw new Error(`Workflow schedule claim returned ${response.status}`);
  const body = (await response.json()) as { runs?: unknown[] };
  const runs = (body.runs ?? [])
    .map((run) => platformWorkflowPayloadSchema.safeParse(run))
    .filter((result): result is { success: true; data: PlatformWorkflowPayload } => result.success)
    .map((result) => ({ id: result.data.runId, params: result.data }));
  if (!runs.length) return;
  try {
    await env.WORKFLOWS.createBatch(runs);
  } catch {
    await Promise.allSettled(runs.map((run) => env.WORKFLOWS.create(run)));
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  let difference = leftBytes.byteLength ^ rightBytes.byteLength;
  const length = Math.max(leftBytes.byteLength, rightBytes.byteLength);
  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}
