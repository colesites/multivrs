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
  const url = new URL(request.url);
  if (url.pathname.startsWith("/_multivrs/")) return;
  const country = typeof request.cf?.country === "string" ? request.cf.country : "";
  const colo = typeof request.cf?.colo === "string" ? request.cf.colo : "";
  const sessionId =
    request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)multivrs_session=([0-9a-f-]{36})(?:;|$)/i)?.[1] ?? "";
  env.ANALYTICS.writeDataPoint({
    indexes: [projectId],
    blobs: [
      deploymentId,
      url.hostname,
      url.pathname,
      "request",
      country,
      colo,
      request.method,
      sessionId,
    ],
    doubles: [response.status, durationMs, Number(response.headers.get("content-length") ?? 0)],
  });
}
