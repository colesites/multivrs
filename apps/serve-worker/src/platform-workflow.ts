import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { z } from "zod";
import type { Env } from "./types";
import { recordUsage } from "./usage";

const MAX_RESPONSE_BYTES = 256_000;

const workflowStepSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("http"),
    name: z.string().min(1).max(80),
    url: z.url().max(2_048),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    headers: z.record(z.string(), z.string()),
    body: z.string().max(256_000).optional(),
    retries: z.number().int().min(0).max(5),
    timeoutSeconds: z.number().int().min(1).max(300),
  }),
  z.object({
    type: z.literal("delay"),
    name: z.string().min(1).max(80),
    durationSeconds: z.number().int().min(1).max(2_592_000),
  }),
]);

export const platformWorkflowPayloadSchema = z.object({
  input: z.json().optional(),
  projectId: z.string().uuid(),
  runId: z.string().uuid(),
  steps: z.array(workflowStepSchema).min(1).max(50),
  workflowId: z.string().uuid(),
});

export type PlatformWorkflowPayload = z.infer<typeof platformWorkflowPayloadSchema>;

interface WorkflowHttpResult {
  body: string;
  contentType: string | null;
  status: number;
}

export class MultivrsWorkflow extends WorkflowEntrypoint<Env, PlatformWorkflowPayload> {
  async run(
    event: Readonly<WorkflowEvent<PlatformWorkflowPayload>>,
    step: WorkflowStep,
  ): Promise<unknown> {
    const payload = platformWorkflowPayloadSchema.parse(event.payload);
    await notifyWorkflowStatus(this.env, payload.runId, event.instanceId, "running");
    const results: Array<WorkflowHttpResult | { delayedSeconds: number }> = [];
    try {
      for (const [index, definition] of payload.steps.entries()) {
        const durableName = `${index + 1}. ${definition.name}`;
        if (definition.type === "delay") {
          await step.sleep(durableName, definition.durationSeconds);
          results.push({ delayedSeconds: definition.durationSeconds });
          continue;
        }
        const result = await step.do(
          durableName,
          {
            retries: {
              backoff: "exponential",
              delay: 1,
              limit: definition.retries,
            },
            timeout: definition.timeoutSeconds,
          },
          () => safeWorkflowFetch(definition),
        );
        results.push(result);
        recordUsage(this.env, payload.projectId, "workflow_data_written_bytes", byteLength(result));
      }
      const output = { input: payload.input ?? null, results };
      await notifyWorkflowStatus(this.env, payload.runId, event.instanceId, "complete", output);
      return output;
    } catch (error) {
      await notifyWorkflowStatus(
        this.env,
        payload.runId,
        event.instanceId,
        "errored",
        undefined,
        error instanceof Error ? error.message : "Workflow execution failed",
      );
      throw error;
    }
  }
}

async function safeWorkflowFetch(
  definition: Extract<PlatformWorkflowPayload["steps"][number], { type: "http" }>,
): Promise<WorkflowHttpResult> {
  let url = validatePublicHttpsUrl(definition.url);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      body:
        definition.method === "GET" || definition.method === "DELETE" ? undefined : definition.body,
      headers: stripUnsafeHeaders(definition.headers),
      method: definition.method,
      redirect: "manual",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) {
        throw new NonRetryableError("Workflow HTTP redirect limit exceeded");
      }
      url = validatePublicHttpsUrl(new URL(location, url).toString());
      continue;
    }
    const body = await readBoundedText(response);
    if (!response.ok) {
      throw new Error(`Workflow HTTP step returned ${response.status}: ${body.slice(0, 1_000)}`);
    }
    return {
      body,
      contentType: response.headers.get("content-type"),
      status: response.status,
    };
  }
  throw new NonRetryableError("Workflow HTTP redirect limit exceeded");
}

function validatePublicHttpsUrl(value: string): URL {
  const url = new URL(value);
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname === "0.0.0.0" ||
    hostname === "[::]" ||
    hostname === "[::1]" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
  ) {
    throw new NonRetryableError("Workflow HTTP steps require a public HTTPS hostname");
  }
  return url;
}

function stripUnsafeHeaders(input: Record<string, string>): Headers {
  const headers = new Headers(input);
  for (const name of [
    "cf-connecting-ip",
    "content-length",
    "host",
    "transfer-encoding",
    "x-forwarded-for",
  ]) {
    headers.delete(name);
  }
  return headers;
}

async function readBoundedText(response: Response): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    throw new NonRetryableError("Workflow HTTP response exceeds 256 KB");
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    received += chunk.value.byteLength;
    if (received > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new NonRetryableError("Workflow HTTP response exceeds 256 KB");
    }
    chunks.push(chunk.value);
  }
  const combined = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

async function notifyWorkflowStatus(
  env: Env,
  runId: string,
  instanceId: string,
  status: "running" | "complete" | "errored" | "terminated",
  output?: unknown,
  errorMessage?: string,
): Promise<void> {
  const endpoint = new URL("/api/workflows/internal/status", env.CONTROL_PLANE_URL);
  const headers = new Headers({ "content-type": "application/json" });
  if (env.CONTROL_PLANE_TOKEN) {
    headers.set("authorization", `Bearer ${env.CONTROL_PLANE_TOKEN}`);
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ errorMessage, instanceId, output, runId, status }),
  });
  if (!response.ok) throw new Error(`Workflow status callback returned ${response.status}`);
}

function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}
