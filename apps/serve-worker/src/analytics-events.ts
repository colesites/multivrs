import { z } from "zod";
import type { ControlResolution } from "./control";
import type { Env } from "./types";

const contextSchema = z.object({
  browser: z.string().trim().max(40).default("Other"),
  device: z.enum(["desktop", "mobile", "tablet"]),
  path: z.string().startsWith("/").max(2_000),
  referrer: z.string().trim().max(253).default(""),
  sessionId: z.uuid(),
  utmCampaign: z.string().trim().max(200).default(""),
  utmMedium: z.string().trim().max(200).default(""),
  utmSource: z.string().trim().max(200).default(""),
  visitorId: z.uuid(),
});

const primitive = z.union([z.boolean(), z.number().finite(), z.string().max(500), z.null()]);
const eventSchema = z.discriminatedUnion("kind", [
  contextSchema.extend({ kind: z.literal("pageview") }),
  contextSchema.extend({
    kind: z.literal("custom"),
    name: z.string().trim().min(1).max(100),
    properties: z.record(z.string().max(80), primitive).default({}),
  }),
]);

export async function collectAnalyticsEvent(
  request: Request,
  env: Env,
  deployment: ControlResolution,
): Promise<Response> {
  if (!deployment.analyticsEnabled || !env.ANALYTICS) return empty();
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 64_000) return Response.json({ error: "Event is too large" }, { status: 413 });
  const parsed = eventSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid analytics event" }, { status: 400 });
  const data = parsed.data;
  const url = new URL(request.url);
  env.ANALYTICS.writeDataPoint({
    indexes: [deployment.projectId],
    blobs: [
      deployment.deploymentId,
      url.hostname,
      data.path,
      data.kind === "custom" ? "custom-event" : "pageview",
      data.kind === "custom" ? data.name : data.referrer,
      data.visitorId,
      data.sessionId,
      data.device,
      data.browser,
      data.utmSource,
      data.utmMedium,
      data.utmCampaign,
      data.kind === "custom" ? JSON.stringify(data.properties) : "",
    ],
    doubles: [1],
  });
  return empty();
}

function empty(): Response {
  return new Response(null, { status: 204 });
}
