import { z } from "zod";
import type { ControlResolution } from "./control";
import type { Env } from "./types";

const vitalSchema = z.object({
  name: z.enum(["CLS", "INP", "LCP", "TTFB"]),
  path: z.string().startsWith("/").max(2_000),
  value: z.number().finite().nonnegative().max(600_000),
});

const SCRIPT = `(()=>{const p='/_multivrs/vitals';const send=(name,value)=>navigator.sendBeacon(p,new Blob([JSON.stringify({name,value,path:location.pathname})],{type:'application/json'}));let lcp=0,cls=0,inp=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())inp=Math.max(inp,e.duration)}).observe({type:'event',buffered:true,durationThreshold:40})}catch{}addEventListener('load',()=>{const n=performance.getEntriesByType('navigation')[0];if(n)send('TTFB',n.responseStart)});addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){if(lcp)send('LCP',lcp);send('CLS',cls);if(inp)send('INP',inp)}},{once:true})})();`;

export function insightsScript(): Response {
  return new Response(SCRIPT, {
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
    ],
    doubles: [parsed.data.value, 0, 0],
  });
  return new Response(null, { status: 204 });
}

export function instrumentHtml(response: Response): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;
  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append(
          '<script defer src="/_multivrs/insights.js" data-multivrs-insights></script>',
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
