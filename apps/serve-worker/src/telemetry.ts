import type { Env } from "./types";

export function recordRequest(
  env: Env,
  request: Request,
  projectId: string,
  deploymentId: string,
  response: Response,
  durationMs: number,
): void {
  if (!env.ANALYTICS) return;
  const country = typeof request.cf?.country === "string" ? request.cf.country : "";
  const colo = typeof request.cf?.colo === "string" ? request.cf.colo : "";
  env.ANALYTICS.writeDataPoint({
    indexes: [projectId],
    blobs: [
      deploymentId,
      new URL(request.url).hostname,
      new URL(request.url).pathname,
      request.method,
      country,
      colo,
    ],
    doubles: [response.status, durationMs, Number(response.headers.get("content-length") ?? 0)],
  });
}
