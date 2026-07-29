import { getPlatformHealth } from "@/lib/services/health.service";

export async function GET() {
  const health = await getPlatformHealth();
  return Response.json(health, {
    status: health.status === "ready" ? 200 : 503,
  });
}
