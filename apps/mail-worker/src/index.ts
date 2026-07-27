import { z } from "zod";
import { signedHeaders, validSignature } from "./signature";
import type { Env, MailJob } from "./types";

const jobSchema = z.object({ userId: z.string().min(1), messageId: z.uuid() });
const dueJobsSchema = z.object({ jobs: z.array(jobSchema) });

async function queue(request: Request, env: Env) {
  const body = await request.text();
  if (!(await validSignature(request, env.MAIL_WORKER_SECRET, body))) {
    return new Response("Unauthorized", { status: 401 });
  }
  const job = jobSchema.parse(JSON.parse(body));
  await env.MAIL_QUEUE.send(job);
  return Response.json({ queued: true }, { status: 202 });
}

async function deliver(job: MailJob, env: Env) {
  const body = JSON.stringify(job);
  const response = await fetch(`${env.CONTROL_PLANE_URL}/api/mail/internal/deliver`, {
    method: "POST",
    headers: await signedHeaders(env.MAIL_WORKER_SECRET, body),
    body,
  });
  if (!response.ok) throw new Error(`Control plane rejected mail delivery (${response.status})`);
}

async function queueDue(env: Env) {
  const body = "{}";
  const response = await fetch(`${env.CONTROL_PLANE_URL}/api/mail/internal/due`, {
    method: "POST",
    headers: await signedHeaders(env.MAIL_WORKER_SECRET, body),
    body,
  });
  if (!response.ok) throw new Error("Unable to load scheduled mail");
  const due = dueJobsSchema.parse(await response.json());
  if (due.jobs.length) await env.MAIL_QUEUE.sendBatch(due.jobs.map((job) => ({ body: job })));
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/queue") return queue(request, env);
    return new Response("Not found", { status: 404 });
  },
  async queue(batch: MessageBatch<MailJob>, env: Env) {
    for (const message of batch.messages) {
      try {
        await deliver(jobSchema.parse(message.body), env);
        message.ack();
      } catch {
        message.retry();
      }
    }
  },
  async scheduled(_controller: ScheduledController, env: Env) {
    await queueDue(env);
  },
} satisfies ExportedHandler<Env, MailJob>;
