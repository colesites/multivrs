import type { AppDeps, MerchantContext } from "../app.types";
import { monthsPerPeriod } from "./billing-period";
import type { Payment } from "./payment.types";

const DAY = 86_400;
const WINDOW_DAYS = 30;
/** Rows considered per resource; enough for the dashboard's 30-day view. */
const SAMPLE = 1000;

export interface CurrencyTotals {
  currency: string;
  gross: number;
  refunded: number;
  provider_fees: number;
  platform_fees: number;
  /** What the merchant keeps: gross minus refunds, Stripe's fees and ours. */
  net: number;
  payments: number;
}

/** Totals for the last 30 days, per currency (amounts in minor units). */
function totalsByCurrency(
  payments: Payment[],
  refunds: Array<{ currency: string; amount: number; status: string }>,
) {
  const totals = new Map<string, CurrencyTotals>();
  const get = (currency: string) => {
    const t = totals.get(currency) ?? {
      currency,
      gross: 0,
      refunded: 0,
      provider_fees: 0,
      platform_fees: 0,
      net: 0,
      payments: 0,
    };
    totals.set(currency, t);
    return t;
  };
  for (const p of payments) {
    const t = get(p.currency);
    t.gross += p.amount;
    t.provider_fees += p.provider_fee;
    t.platform_fees += p.platform_fee;
    t.payments += 1;
  }
  for (const r of refunds) if (r.status === "succeeded") get(r.currency).refunded += r.amount;
  for (const t of totals.values()) t.net = t.gross - t.refunded - t.provider_fees - t.platform_fees;
  return [...totals.values()].sort((a, b) => b.gross - a.gross);
}

/** The dashboard overview: revenue, MRR, subscribers and customers. */
export async function overview(deps: AppDeps, merchant: MerchantContext) {
  const now = Math.floor(Date.now() / 1000);
  const since = now - WINDOW_DAYS * DAY;
  const scope = { merchantId: merchant.id, mode: merchant.mode };
  const [payments, refunds, subscriptions, customers, catalog] = await Promise.all([
    deps.payments.list(merchant.id, merchant.mode, SAMPLE),
    deps.refunds.list(merchant.id, merchant.mode, SAMPLE),
    deps.billing.listSubscriptions(scope),
    deps.customers.list(merchant.id, merchant.mode, SAMPLE),
    deps.catalog.load(scope),
  ]);
  const recent = payments.map((p) => p.payment).filter((p) => p.created >= since);
  const totals = totalsByCurrency(
    recent,
    refunds.map((r) => r.refund).filter((r) => r.created >= since),
  );
  const primary = totals[0]?.currency ?? "gbp";

  // Calendar days (UTC) ending today, so today's payments land on today's label.
  const today = now - (now % DAY);
  const daily = Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const start = today - (WINDOW_DAYS - 1 - i) * DAY;
    const amount = recent
      .filter((p) => p.currency === primary && p.created >= start && p.created < start + DAY)
      .reduce((sum, p) => sum + p.amount, 0);
    return { date: new Date(start * 1000).toISOString().slice(0, 10), amount };
  });

  const prices = new Map(
    catalog.plans.flatMap((plan) => plan.prices.map((price) => [price.id, price])),
  );
  const mrr = new Map<string, number>();
  const counts = { active: 0, trialing: 0, past_due: 0, canceled_30d: 0 };
  for (const { subscription: s } of subscriptions) {
    if (s.status === "active" || s.status === "trialing" || s.status === "past_due")
      counts[s.status] += 1;
    if (s.status === "canceled" && (s.canceled_at ?? 0) >= since) counts.canceled_30d += 1;
    const price = prices.get(s.price);
    if (!price || (s.status !== "active" && s.status !== "past_due")) continue;
    const monthly = Math.round((price.amount * s.quantity) / monthsPerPeriod(price));
    mrr.set(price.currency, (mrr.get(price.currency) ?? 0) + monthly);
  }

  return {
    object: "overview" as const,
    window_days: WINDOW_DAYS,
    currency: primary,
    totals,
    daily,
    mrr: [...mrr.entries()].map(([currency, amount]) => ({ currency, amount })),
    subscriptions: counts,
    customers: {
      total: customers.length,
      new_30d: customers.filter((c) => c.customer.created >= since).length,
    },
    recent_payments: payments.slice(0, 5).map((p) => p.payment),
  };
}
