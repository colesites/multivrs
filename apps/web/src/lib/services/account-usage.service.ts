import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";
import { prisma } from "@/lib/prisma";

const responseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});
const EMPTY: AccountUsage = {
  averageLatency: 0,
  bandwidthBytes: 0,
  requests: 0,
  series: [],
  state: "unconfigured",
};

function number(row: Record<string, unknown> | undefined, key: string): number {
  const value = row?.[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function query(sql: string): Promise<Record<string, unknown>[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics is not configured");
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/analytics_engine/sql`,
    {
      body: sql,
      headers: { authorization: `Bearer ${token}` },
      method: "POST",
    },
  );
  if (!response.ok)
    throw new Error(`Cloudflare Analytics returned ${response.status}`);
  return responseSchema.parse(await response.json()).data;
}

export async function getAccountUsage(userId: string): Promise<AccountUsage> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const ids = projects.map((project) =>
    z.uuid().parse(project.id).replaceAll("'", "''"),
  );
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  )
    return EMPTY;
  if (!ids.length) return { ...EMPTY, state: "ready" };
  const filter = `index1 IN (${ids.map((id) => `'${id}'`).join(",")}) AND blob4 != 'web-vital' AND timestamp >= NOW() - INTERVAL '14' DAY`;
  try {
    const [summaryRows, seriesRows] = await Promise.all([
      query(
        `SELECT SUM(_sample_interval) requests, AVG(double2) latency, SUM(double3 * _sample_interval) bytes FROM multivrs_requests WHERE ${filter}`,
      ),
      query(
        `SELECT toDate(timestamp) day, SUM(_sample_interval) requests FROM multivrs_requests WHERE ${filter} GROUP BY day ORDER BY day`,
      ),
    ]);
    return {
      averageLatency: Math.round(number(summaryRows[0], "latency")),
      bandwidthBytes: number(summaryRows[0], "bytes"),
      requests: number(summaryRows[0], "requests"),
      series: seriesRows.map((row) => ({
        day: String(row.day ?? ""),
        requests: number(row, "requests"),
      })),
      state: "ready",
    };
  } catch {
    return { ...EMPTY, state: "error" };
  }
}
