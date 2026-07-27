import "server-only";
import { prisma } from "@/lib/prisma";

export interface PlatformHealth {
  database: "ready" | "unavailable";
  integrations: {
    analytics: boolean;
    builds: boolean;
    cloudflare: boolean;
    domains: boolean;
    stripe: boolean;
  };
  status: "degraded" | "ready";
  timestamp: string;
}

export async function getPlatformHealth(): Promise<PlatformHealth> {
  let database: PlatformHealth["database"] = "ready";
  try {
    await prisma.user.count({ take: 1 });
  } catch {
    database = "unavailable";
  }
  const integrations = {
    analytics: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.CLOUDFLARE_ANALYTICS_API_TOKEN,
    ),
    builds: Boolean(
      process.env.BUILD_WORKER_URL && process.env.BUILD_WORKER_TOKEN,
    ),
    cloudflare: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN,
    ),
    domains: Boolean(
      process.env.OPENPROVIDER_USERNAME && process.env.OPENPROVIDER_PASSWORD,
    ),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  };
  return {
    database,
    integrations,
    status: database === "ready" ? "ready" : "degraded",
    timestamp: new Date().toISOString(),
  };
}
