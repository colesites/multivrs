import { getPlatformHealth } from "@/lib/services/health.service";

export const runtime = "nodejs";

export async function GET() {
  const health = await getPlatformHealth();
  return Response.json(health, {
    status: health.status === "ready" ? 200 : 503,
  });
}
