import type { AppDeps, MerchantContext } from "../app.types";
import type { OnboardingRecord } from "./onboarding.types";

/** Default reserve hold days if no onboarding profile is present. */
export const HOLD_DAYS = 7;
const DAY = 86_400;

export interface HoldPolicy {
  hold_days: number;
  speed_label: "2-3 business days" | "7 days" | "7-14 business days";
  category: "domestic_accelerated" | "standard" | "cross_border";
  description: string;
}

/**
 * Determines payout speed / reserve hold policy following Stripe's tier system:
 * - 2-3 business days: Domestic verified merchants in primary corridors (US, UK, EU, CA, AU)
 * - 7 days: Standard rolling hold for newly activated accounts and standard risk
 * - 7-14 business days: Cross-border accounts with international currency conversions
 */
export function holdPolicyForMerchant(onboarding: OnboardingRecord | null): HoldPolicy {
  if (!onboarding) {
    return {
      hold_days: 7,
      speed_label: "7 days",
      category: "standard",
      description: "Standard 7-day reserve schedule for new accounts.",
    };
  }

  const country = onboarding.country?.toUpperCase();
  const payoutCurrency = onboarding.payoutCurrency?.toUpperCase();
  const isVerified = onboarding.status === "verified";

  // Tier 1 Domestic: US / GB / EU domestic accounts with local matching currency
  const isDomesticTier1 =
    (country === "US" && payoutCurrency === "USD") ||
    (country === "GB" && payoutCurrency === "GBP") ||
    (["DE", "FR", "IE", "NL", "ES", "IT"].includes(country ?? "") && payoutCurrency === "EUR");

  // Cross-border / international: e.g. international bank accounts or foreign currency payouts
  const isCrossBorder =
    payoutCurrency === "NGN" ||
    (country && !["US", "GB", "DE", "FR", "IE", "NL", "ES", "IT", "CA", "AU"].includes(country)) ||
    (country === "US" && payoutCurrency && payoutCurrency !== "USD") ||
    (country === "GB" && payoutCurrency && payoutCurrency !== "GBP");

  if (isCrossBorder) {
    return {
      hold_days: 7,
      speed_label: "7-14 business days",
      category: "cross_border",
      description: "7–14 business day international payout schedule for cross-border currency settlement.",
    };
  }

  if (isVerified && isDomesticTier1) {
    return {
      hold_days: 3,
      speed_label: "2-3 business days",
      category: "domestic_accelerated",
      description: "Accelerated 2–3 business day domestic payout schedule.",
    };
  }

  return {
    hold_days: 7,
    speed_label: "7 days",
    category: "standard",
    description: "Standard 7-day rolling hold for newly active accounts.",
  };
}

export interface IncomingScheduleItem {
  date: string;
  display_date: string;
  amount: number;
  count: number;
}

export interface CurrencyBalance {
  currency: string;
  /** Ready to pay out. */
  available: number;
  /** From sales within the rolling hold window. */
  pending: number;
  /** Breakdown of pending funds grouped by estimated clearance date. */
  incoming_schedule: IncomingScheduleItem[];
}

/** What VRS Pay owes the merchant, per currency, from their ledger account. */
export async function merchantBalance(deps: AppDeps, merchant: MerchantContext) {
  const onboarding = await deps.onboarding.get(merchant.id);
  const policy = holdPolicyForMerchant(onboarding);

  const entries = await deps.ledger.entries(
    { kind: "merchant_balance", owner: merchant.id },
    merchant.mode,
  );

  const now = Math.floor(Date.now() / 1000);
  const holdFrom = now - policy.hold_days * DAY;

  const totals = new Map<string, CurrencyBalance>();
  const incomingMap = new Map<
    string,
    Map<string, { display_date: string; timestamp: number; amount: number; count: number }>
  >();

  for (const { direction, amount, at } of entries) {
    const currency = amount.currency.toLowerCase();
    const t = totals.get(currency) ?? {
      currency,
      available: 0,
      pending: 0,
      incoming_schedule: [],
    };
    const signed = direction === "credit" ? amount.amount : -amount.amount;

    if (direction === "credit" && at >= holdFrom) {
      t.pending += signed;

      // Calculate estimated settlement / clearance date
      const clearanceTimestamp = at + policy.hold_days * DAY;
      const clearDate = new Date(clearanceTimestamp * 1000);
      const dateKey = clearDate.toISOString().slice(0, 10);
      const displayDate = clearDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (!incomingMap.has(currency)) {
        incomingMap.set(currency, new Map());
      }
      const curMap = incomingMap.get(currency)!;
      const existing = curMap.get(dateKey);
      if (existing) {
        existing.amount += signed;
        existing.count += 1;
      } else {
        curMap.set(dateKey, {
          display_date: displayDate,
          timestamp: clearanceTimestamp,
          amount: signed,
          count: 1,
        });
      }
    } else {
      t.available += signed;
    }
    totals.set(currency, t);
  }

  // Populate incoming_schedule sorted chronologically
  for (const [currency, curMap] of incomingMap) {
    const t = totals.get(currency);
    if (t) {
      t.incoming_schedule = Array.from(curMap.entries())
        .map(([date, val]) => ({
          date,
          display_date: val.display_date,
          timestamp: val.timestamp,
          amount: val.amount,
          count: val.count,
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ date, display_date, amount, count }) => ({
          date,
          display_date,
          amount,
          count,
        }));
    }
  }

  return {
    object: "balance" as const,
    hold_days: policy.hold_days,
    speed_label: policy.speed_label,
    category: policy.category,
    description: policy.description,
    data: [...totals.values()],
  };
}
