import {
  ADD_ON_CATALOG,
  METER_CATALOG,
  RESOURCE_LIMITS,
} from "./billing.catalog";
import type {
  AddOnKey,
  EntitlementContext,
  ResourceKey,
  UsageDecision,
} from "./billing.types";

export function resourceLimit(
  context: EntitlementContext,
  resource: ResourceKey,
): number | null {
  if (context.isLimitExempt) return null;
  const override = context.entitlementOverrides[resource];
  if (override !== undefined) return override;
  const base = RESOURCE_LIMITS[resource][context.plan];
  if (resource === "developer_seats" && base !== null) {
    return base + (context.addOns.developer_seat ?? 0);
  }
  return base;
}

export function hasAddOn(
  context: EntitlementContext,
  addOn: AddOnKey,
  projectId?: string,
  projectIds: string[] = [],
): boolean {
  if (context.isLimitExempt || context.plan === "enterprise") return true;
  if ((context.addOns[addOn] ?? 0) < 1) return false;
  return (
    !ADD_ON_CATALOG[addOn].projectScoped ||
    Boolean(projectId && projectIds.includes(projectId))
  );
}

export function metricAllowance(
  context: EntitlementContext,
  metric: string,
): bigint | null {
  if (context.isLimitExempt) return null;
  const override = context.entitlementOverrides[metric];
  if (override !== undefined)
    return override === null ? null : BigInt(override);
  const definition = METER_CATALOG[metric];
  if (!definition || context.plan === "enterprise") return null;
  const base =
    context.plan === "pro"
      ? definition.proAllowance
      : definition.hobbyAllowance;
  if (metric === "mail_email_units") {
    return base + BigInt(context.addOns.mail_volume ?? 0) * 5_000n;
  }
  return base;
}

export function decideUsage(input: {
  context: EntitlementContext;
  currentEstimatedCostCents: number;
  metric: string;
  quantity: bigint;
  used: bigint;
}): UsageDecision {
  const definition = METER_CATALOG[input.metric];
  const allowance = metricAllowance(input.context, input.metric);
  if (!definition || allowance === null) return allowed(0n, 0);
  const previousOverage = positive(input.used - allowance);
  const nextOverage = positive(input.used + input.quantity - allowance);
  const overageDelta = nextOverage - previousOverage;
  if (overageDelta === 0n) return allowed(0n, 0);
  if (input.context.plan === "hobby") {
    return denied("This Hobby plan limit has been reached.");
  }
  if (!input.context.overagesEnabled) {
    return denied(
      "Enable paid overages or raise this plan's allowance to continue.",
    );
  }
  const unitPrice =
    input.context.overageRateOverrides[input.metric] ??
    definition.unitPriceCents;
  const before = packageCost(previousOverage, definition.unitSize, unitPrice);
  const after = packageCost(nextOverage, definition.unitSize, unitPrice);
  const estimatedCostDeltaCents = after - before;
  const projected = input.currentEstimatedCostCents + estimatedCostDeltaCents;
  if (
    input.context.spendLimitCents !== null &&
    projected > input.context.spendLimitCents
  ) {
    return denied("Your monthly usage spend limit has been reached.");
  }
  return allowed(overageDelta, estimatedCostDeltaCents);
}

function packageCost(quantity: bigint, size: bigint, cents: number): number {
  if (quantity <= 0n) return 0;
  const packages = (quantity + size - 1n) / size;
  const priceScale = 1_000n;
  const scaledUnitPrice = BigInt(Math.round(cents * Number(priceScale)));
  return Number((packages * scaledUnitPrice + priceScale - 1n) / priceScale);
}

function positive(value: bigint): bigint {
  return value > 0n ? value : 0n;
}

function allowed(overageDelta: bigint, cost: number): UsageDecision {
  return {
    allowed: true,
    estimatedCostDeltaCents: cost,
    overageDelta,
    reason: null,
  };
}

function denied(reason: string): UsageDecision {
  return {
    allowed: false,
    estimatedCostDeltaCents: 0,
    overageDelta: 0n,
    reason,
  };
}
