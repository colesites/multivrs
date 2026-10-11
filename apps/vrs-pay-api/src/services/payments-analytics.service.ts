import type { AppDeps, MerchantContext } from "../app.types";
import type { Payment } from "./payment.types";

const DAY = 86_400;

export interface PaymentsAnalyticsOptions {
  rangeDays?: number;
}

export interface MetricWithTrend {
  value: number;
  previous: number;
  trend_pct: number;
}

export interface TimeSeriesPoint {
  date: string;
  label: string;
  timestamp: number;
  accepted_volume: number;
  accepted_payments: number;
  success_rate: number;
  net_volume: number;
}

export interface MethodBreakdown {
  category: string;
  label: string;
  volume: number;
  count: number;
  share: number;
}

export interface StatusBreakdown {
  status: string;
  label: string;
  volume: number;
  count: number;
}

export interface PaymentsAnalyticsResult {
  object: "payments.analytics";
  range_days: number;
  currency: string;
  metrics: {
    success_rate: MetricWithTrend;
    accepted_volume: MetricWithTrend;
    accepted_payments: MetricWithTrend;
    net_volume: MetricWithTrend;
    refunded_volume: MetricWithTrend;
  };
  time_series: TimeSeriesPoint[];
  breakdown: {
    methods: MethodBreakdown[];
    statuses: StatusBreakdown[];
  };
}

function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

export async function paymentsAnalytics(
  deps: AppDeps,
  merchant: MerchantContext,
  options: PaymentsAnalyticsOptions = {},
): Promise<PaymentsAnalyticsResult> {
  const rangeDays = Math.max(1, Math.min(options.rangeDays ?? 30, 90));
  const now = Math.floor(Date.now() / 1000);
  const currentStart = now - rangeDays * DAY;
  const previousStart = currentStart - rangeDays * DAY;

  const [allPayments, allRefunds, checkoutMetrics] = await Promise.all([
    deps.payments.list(merchant.id, merchant.mode, 2000),
    deps.refunds.list(merchant.id, merchant.mode, 2000),
    deps.checkoutSessions.metrics(merchant.id, merchant.mode, previousStart),
  ]);

  const payments = allPayments.map((p) => p.payment);
  const refunds = allRefunds.map((r) => r.refund);

  // Split into current and previous period
  const currentPayments = payments.filter((p) => p.created >= currentStart && p.created <= now);
  const previousPayments = payments.filter(
    (p) => p.created >= previousStart && p.created < currentStart,
  );

  const currentRefunds = refunds.filter((r) => r.created >= currentStart && r.created <= now);
  const previousRefunds = refunds.filter(
    (r) => r.created >= previousStart && r.created < currentStart,
  );

  // Primary currency
  const currency = currentPayments[0]?.currency ?? payments[0]?.currency ?? "usd";

  // Filter to primary currency for uniform financial metrics
  const currInCur = currentPayments.filter((p) => p.currency === currency);
  const prevInCur = previousPayments.filter((p) => p.currency === currency);

  // Accepted volume & count (succeeded)
  const currAcceptedPayments = currInCur.filter((p) => p.status === "succeeded");
  const prevAcceptedPayments = prevInCur.filter((p) => p.status === "succeeded");

  const currGross = currAcceptedPayments.reduce((s, p) => s + p.amount, 0);
  const prevGross = prevAcceptedPayments.reduce((s, p) => s + p.amount, 0);

  const currRefunded = currentRefunds
    .filter((r) => r.currency === currency && r.status === "succeeded")
    .reduce((s, r) => s + r.amount, 0);
  const prevRefunded = previousRefunds
    .filter((r) => r.currency === currency && r.status === "succeeded")
    .reduce((s, r) => s + r.amount, 0);

  const currProviderFee = currAcceptedPayments.reduce((s, p) => s + p.provider_fee, 0);
  const prevProviderFee = prevAcceptedPayments.reduce((s, p) => s + p.provider_fee, 0);
  const currPlatformFee = currAcceptedPayments.reduce((s, p) => s + p.platform_fee, 0);
  const prevPlatformFee = prevAcceptedPayments.reduce((s, p) => s + p.platform_fee, 0);

  const currNet = currGross - currRefunded - currProviderFee - currPlatformFee;
  const prevNet = prevGross - prevRefunded - prevProviderFee - prevPlatformFee;

  // Success rate
  const currTotalSessions = Math.max(checkoutMetrics.total, currInCur.length);
  const currSuccessRate =
    currTotalSessions > 0
      ? Number(((currAcceptedPayments.length / currTotalSessions) * 100).toFixed(2))
      : 100;
  const prevSuccessRate = prevInCur.length > 0 ? 100 : 100;

  // Time series generation
  const todayStart = now - (now % DAY);
  const isWeekly = rangeDays > 45;
  const bucketCount = isWeekly ? Math.ceil(rangeDays / 7) : rangeDays;
  const bucketSeconds = isWeekly ? 7 * DAY : DAY;

  const timeSeries: TimeSeriesPoint[] = Array.from({ length: bucketCount }, (_, i) => {
    const bucketStart = todayStart - (bucketCount - 1 - i) * bucketSeconds;
    const bucketEnd = bucketStart + bucketSeconds;

    const inBucket = currInCur.filter((p) => p.created >= bucketStart && p.created < bucketEnd);
    const succeededInBucket = inBucket.filter((p) => p.status === "succeeded");

    const acceptedVolume = succeededInBucket.reduce((sum, p) => sum + p.amount, 0);
    const providerFees = succeededInBucket.reduce((sum, p) => sum + p.provider_fee, 0);
    const platformFees = succeededInBucket.reduce((sum, p) => sum + p.platform_fee, 0);
    const refundedInBucket = currentRefunds
      .filter((r) => r.currency === currency && r.created >= bucketStart && r.created < bucketEnd)
      .reduce((sum, r) => sum + r.amount, 0);

    const netVolume = acceptedVolume - refundedInBucket - providerFees - platformFees;
    const successRate =
      inBucket.length > 0
        ? Number(((succeededInBucket.length / inBucket.length) * 100).toFixed(1))
        : 100;

    const dateObj = new Date(bucketStart * 1000);
    const label = isWeekly
      ? `${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    return {
      date: dateObj.toISOString().slice(0, 10),
      label,
      timestamp: bucketStart,
      accepted_volume: acceptedVolume,
      accepted_payments: succeededInBucket.length,
      success_rate: successRate,
      net_volume: netVolume,
    };
  });

  // Method breakdown (by provider)
  const methodMap = new Map<string, { label: string; volume: number; count: number }>();
  for (const p of currInCur) {
    const key = p.provider || "card";
    const label = key === "stripe" ? "Card (Stripe)" : key.toUpperCase();
    const existing = methodMap.get(key) ?? { label, volume: 0, count: 0 };
    existing.volume += p.amount;
    existing.count += 1;
    methodMap.set(key, existing);
  }
  const totalMethodVolume = Math.max(1, currGross);
  const methodBreakdown: MethodBreakdown[] = [...methodMap.entries()].map(([category, m]) => ({
    category,
    label: m.label,
    volume: m.volume,
    count: m.count,
    share: Number(((m.volume / totalMethodVolume) * 100).toFixed(1)),
  }));

  // Status breakdown
  const statusMap = new Map<string, { label: string; volume: number; count: number }>();
  for (const p of currInCur) {
    const label =
      p.status === "succeeded"
        ? "Succeeded"
        : p.status === "partially_refunded"
          ? "Partially Refunded"
          : "Refunded";
    const existing = statusMap.get(p.status) ?? { label, volume: 0, count: 0 };
    existing.volume += p.amount;
    existing.count += 1;
    statusMap.set(p.status, existing);
  }
  const statusBreakdown: StatusBreakdown[] = [...statusMap.entries()].map(([status, s]) => ({
    status,
    label: s.label,
    volume: s.volume,
    count: s.count,
  }));

  return {
    object: "payments.analytics",
    range_days: rangeDays,
    currency,
    metrics: {
      success_rate: {
        value: currSuccessRate,
        previous: prevSuccessRate,
        trend_pct: calculateTrend(currSuccessRate, prevSuccessRate),
      },
      accepted_volume: {
        value: currGross,
        previous: prevGross,
        trend_pct: calculateTrend(currGross, prevGross),
      },
      accepted_payments: {
        value: currAcceptedPayments.length,
        previous: prevAcceptedPayments.length,
        trend_pct: calculateTrend(currAcceptedPayments.length, prevAcceptedPayments.length),
      },
      net_volume: {
        value: currNet,
        previous: prevNet,
        trend_pct: calculateTrend(currNet, prevNet),
      },
      refunded_volume: {
        value: currRefunded,
        previous: prevRefunded,
        trend_pct: calculateTrend(currRefunded, prevRefunded),
      },
    },
    time_series: timeSeries,
    breakdown: {
      methods: methodBreakdown,
      statuses: statusBreakdown,
    },
  };
}
