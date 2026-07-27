import type { BuildJob } from "@multivrs/client";

async function post(job: BuildJob, path: string, body?: unknown) {
  const response = await fetch(new URL(path, job.apiUrl), {
    method: "POST",
    headers: {
      authorization: `Bearer ${job.apiToken}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Control plane ${path} returned ${response.status}`);
  }
}

export async function appendBuildLog(
  job: BuildJob,
  level: "info" | "warn" | "error",
  message: string,
) {
  await post(job, `/api/projects/${job.projectId}/deployments/${job.deploymentId}/logs`, {
    level,
    message: message.slice(0, 20_000),
  });
}

export async function markBuildFailed(job: BuildJob, message: string) {
  await post(job, `/api/projects/${job.projectId}/deployments/${job.deploymentId}/status`, {
    status: "error",
    message: message.slice(0, 2_000),
  });
}

export async function revokeBuildToken(job: BuildJob) {
  await fetch(new URL("/api/build/token", job.apiUrl), {
    method: "DELETE",
    headers: { authorization: `Bearer ${job.apiToken}` },
  });
}
