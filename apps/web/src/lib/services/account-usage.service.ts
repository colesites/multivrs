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
  metrics: {},
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

export async function getAccountUsage(
  userId: string,
  workspaceUsername: string,
): Promise<AccountUsage> {
  const projects = await prisma.project.findMany({
    where: {
      owner: { username: workspaceUsername },
      OR: [
        { ownerId: userId },
        { organization: { members: { some: { userId } } } },
      ],
    },
    select: { id: true },
  });
  const ids = projects.map((project) =>
    z.uuid().parse(project.id).replaceAll("'", "''"),
  );
  const projectIds = projects.map((project) => project.id);
  const [
    localUsage,
    blobStorage,
    redirectCount,
    edgeConfigCount,
    microfrontendCount,
    activeSandboxCount,
    workflowStorage,
  ] = await Promise.all([
    prisma.usageEvent.groupBy({
      by: ["metric"],
      where: {
        projectId: { in: projectIds },
        occurredAt: { gte: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) },
      },
      _sum: { quantity: true },
    }),
    prisma.projectBlob.aggregate({
      where: { projectId: { in: projectIds }, status: "ready" },
      _sum: { size: true },
    }),
    prisma.bulkRedirect.count({
      where: { projectId: { in: projectIds }, enabled: true },
    }),
    prisma.edgeConfigEntry.count({ where: { projectId: { in: projectIds } } }),
    prisma.microfrontendRoute.count({
      where: { projectId: { in: projectIds }, enabled: true },
    }),
    prisma.platformSandbox.count({
      where: {
        projectId: { in: projectIds },
        status: { in: ["creating", "running"] },
      },
    }),
    prisma.platformWorkflowRun.aggregate({
      where: { projectId: { in: projectIds } },
      _sum: { outputBytes: true, payloadBytes: true },
    }),
  ]);
  const localMetrics = Object.fromEntries(
    localUsage.map((row) => [row.metric, Number(row._sum.quantity ?? 0)]),
  );
  localMetrics.blob_storage_size = Number(blobStorage._sum.size ?? 0);
  localMetrics.bulk_redirects = redirectCount;
  localMetrics.edge_config_entries = edgeConfigCount;
  localMetrics.microfrontend_mounts = microfrontendCount;
  localMetrics.concurrent_sandboxes = activeSandboxCount;
  localMetrics.workflow_data_retained_bytes =
    Number(workflowStorage._sum.payloadBytes ?? 0) +
    Number(workflowStorage._sum.outputBytes ?? 0);
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_ANALYTICS_API_TOKEN
  )
    return { ...EMPTY, metrics: localMetrics, state: "ready" };
  if (!ids.length) return { ...EMPTY, metrics: localMetrics, state: "ready" };
  const filter = `index1 IN (${ids.map((id) => `'${id}'`).join(",")}) AND (blob4 = 'request' OR blob4 IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) AND timestamp >= NOW() - INTERVAL '14' DAY`;
  try {
    const [summaryRows, seriesRows, metricRows] = await Promise.all([
      query(
        `SELECT SUM(_sample_interval) requests, AVG(double2) latency, SUM(double3 * _sample_interval) bytes FROM multivrs_requests WHERE ${filter}`,
      ),
      query(
        `SELECT toDate(timestamp) day, SUM(_sample_interval) requests FROM multivrs_requests WHERE ${filter} GROUP BY day ORDER BY day`,
      ),
      query(
        `SELECT blob1 metric, SUM(double1 * _sample_interval) quantity FROM multivrs_usage WHERE index1 IN (${ids.map((id) => `'${id}'`).join(",")}) AND timestamp >= NOW() - INTERVAL '31' DAY GROUP BY metric`,
      ),
    ]);
    const runtimeMetrics = Object.fromEntries(
      metricRows.map((row) => {
        const metric = String(row.metric ?? "unknown");
        return [metric, number(row, "quantity") + (localMetrics[metric] ?? 0)];
      }),
    );
    return {
      averageLatency: Math.round(number(summaryRows[0], "latency")),
      bandwidthBytes: number(summaryRows[0], "bytes"),
      requests: number(summaryRows[0], "requests"),
      metrics: { ...localMetrics, ...runtimeMetrics },
      series: seriesRows.map((row) => ({
        day: String(row.day ?? ""),
        requests: number(row, "requests"),
      })),
      state: "ready",
    };
  } catch {
    return { ...EMPTY, metrics: localMetrics, state: "error" };
  }
}
