import { z } from "zod";
import { BROWSER_ANALYTICS_SCRIPT } from "./browser-analytics";
import type { ControlResolution } from "./control";
import type { Env } from "./types";

const vitalSchema = z.object({
  browser: z.string().trim().max(40).default("Other"),
  device: z.enum(["desktop", "mobile", "tablet"]).default("desktop"),
  name: z.enum(["CLS", "INP", "LCP", "TTFB"]),
  path: z.string().startsWith("/").max(2_000),
  sessionId: z.uuid().optional(),
  value: z.number().finite().nonnegative().max(600_000),
  visitorId: z.uuid().optional(),
});

export function insightsScript(): Response {
  return new Response(BROWSER_ANALYTICS_SCRIPT, {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-type": "text/javascript; charset=utf-8",
    },
  });
}

export async function collectVital(
  request: Request,
  env: Env,
  deployment: ControlResolution,
): Promise<Response> {
  if (!deployment.speedInsightsEnabled || !env.ANALYTICS) {
    return new Response(null, { status: 204 });
  }
  const parsed = vitalSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid Web Vital" }, { status: 400 });
  const url = new URL(request.url);
  env.ANALYTICS.writeDataPoint({
    indexes: [deployment.projectId],
    blobs: [
      deployment.deploymentId,
      url.hostname,
      parsed.data.path,
      "web-vital",
      parsed.data.name,
      rating(parsed.data.name, parsed.data.value),
      parsed.data.visitorId ?? "",
      parsed.data.sessionId ?? "",
      parsed.data.device,
      parsed.data.browser,
    ],
    doubles: [parsed.data.value, 0, 0],
  });
  return new Response(null, { status: 204 });
}

export function instrumentHtml(
  response: Response,
  deployment: Pick<ControlResolution, "analyticsEnabled" | "speedInsightsEnabled">,
): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("text/html") ||
    (!deployment.analyticsEnabled && !deployment.speedInsightsEnabled)
  ) {
    return response;
  }
  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(
          `<script defer src="/_multivrs/analytics.js" data-analytics="${deployment.analyticsEnabled ? "1" : "0"}" data-speed="${deployment.speedInsightsEnabled ? "1" : "0"}"></script>`,
          { html: true },
        );
      },
    })
    .transform(response);
}

function rating(name: z.infer<typeof vitalSchema>["name"], value: number): string {
  const limits: [number, number] =
    name === "CLS"
      ? [0.1, 0.25]
      : name === "LCP"
        ? [2_500, 4_000]
        : name === "INP"
          ? [200, 500]
          : [800, 1_800];
  const [good, poor] = limits;
  return value <= good ? "good" : value <= poor ? "needs-improvement" : "poor";
}
