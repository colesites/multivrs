import "server-only";
import { ConflictError } from "@multivrs/error-utils";
import { z } from "zod";
import { METER_CATALOG } from "@/lib/payments/billing.catalog";
import { prisma } from "@/lib/prisma";
import { resolveBillingEntitlements } from "@/lib/services/billing-entitlement.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

const responseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())),
});

export async function reconcileCloudflareBillingUsage(now = new Date()) {
  const end = new Date(Math.floor(now.getTime() / 3_600_000) * 3_600_000);
  const start = new Date(end.getTime() - 3_600_000);
  const [requests, runtime, webAnalytics, speedInsights] = await Promise.all([
    analyticsSql(
      `SELECT index1 projectId, SUM(_sample_interval) requests, SUM(double3 * _sample_interval) bytes FROM multivrs_requests WHERE blob4 = 'request' AND timestamp >= '${sqlDate(start)}' AND timestamp < '${sqlDate(end)}' GROUP BY projectId`,
    ),
    analyticsSql(
      `SELECT index1 projectId, blob1 metric, SUM(double1 * _sample_interval) quantity FROM multivrs_usage WHERE timestamp >= '${sqlDate(start)}' AND timestamp < '${sqlDate(end)}' GROUP BY projectId, metric`,
    ),
    analyticsSql(
      `SELECT index1 projectId, SUM(_sample_interval) quantity FROM multivrs_requests WHERE blob4 IN ('pageview', 'custom-event') AND timestamp >= '${sqlDate(start)}' AND timestamp < '${sqlDate(end)}' GROUP BY projectId`,
    ),
    analyticsSql(
      `SELECT index1 projectId, SUM(_sample_interval) quantity FROM multivrs_requests WHERE blob4 = 'web-vital' AND timestamp >= '${sqlDate(start)}' AND timestamp < '${sqlDate(end)}' GROUP BY projectId`,
    ),
  ]);
  const entries = [
    ...requests.flatMap((row) => [
      usageRow(row, "edge_requests", "requests"),
      usageRow(row, "fast_data_transfer", "bytes"),
    ]),
    ...runtime.map((row) =>
      usageRow(row, String(row.metric ?? ""), "quantity"),
    ),
    ...webAnalytics.map((row) =>
      usageRow(row, "web_analytics_events", "quantity"),
    ),
    ...speedInsights.map((row) =>
      usageRow(row, "speed_insights_events", "quantity"),
    ),
  ].filter(isUsageRow);
  const result = await reconcileEntries(entries, end);
  return { ...result, periodEnd: end.toISOString() };
}

type UsageRow = { metric: string; projectId: string; quantity: number };

function usageRow(
  row: Record<string, unknown>,
  metric: string,
  value: string,
): UsageRow | null {
  const quantity = Math.max(0, Math.round(Number(row[value] ?? 0)));
  const projectId = String(row.projectId ?? "");
  return z.uuid().safeParse(projectId).success
    ? { metric, projectId, quantity }
    : null;
}

function isUsageRow(value: UsageRow | null): value is UsageRow {
  return value !== null;
}

async function reconcileEntries(
  entries: UsageRow[],
  end: Date,
  index = 0,
  result = { blocked: 0, recorded: 0 },
): Promise<{ blocked: number; recorded: number }> {
  const entry = entries[index];
  if (!entry) return result;
  const project = await prisma.project.findUnique({
    where: { id: entry.projectId },
    select: { ownerId: true },
  });
  if (!project || !METER_CATALOG[entry.metric] || entry.quantity <= 0) {
    return reconcileEntries(entries, end, index + 1, result);
  }
  try {
    await recordUsageEvent(
      project.ownerId,
      entry.projectId,
      entry.metric,
      entry.quantity,
      { periodEnd: end.toISOString(), source: "cloudflare-analytics" },
      {
        idempotencyKey: `cf:${entry.projectId}:${entry.metric}:${end.toISOString()}`,
      },
    );
    return reconcileEntries(entries, end, index + 1, {
      ...result,
      recorded: result.recorded + 1,
    });
  } catch (error) {
    if (!(error instanceof ConflictError)) throw error;
    const entitlements = await resolveBillingEntitlements(
      project.ownerId,
      entry.projectId,
    );
    await prisma.project.update({
      where: { id: entry.projectId },
      data: {
        usageBlockReason: error.message,
        usageBlockedUntil: entitlements.currentPeriodEnd,
      },
    });
    return reconcileEntries(entries, end, index + 1, {
      ...result,
      blocked: result.blocked + 1,
    });
  }
}

async function analyticsSql(sql: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_ANALYTICS_API_TOKEN;
  if (!accountId || !token)
    throw new Error("Cloudflare Analytics billing is not configured");
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

function sqlDate(value: Date): string {
  return value.toISOString().replace("T", " ").replace(".000Z", "");
}
