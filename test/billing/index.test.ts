import { describe, expect, it } from "bun:test";
import type { EntitlementContext } from "../../apps/web/src/lib/payments/billing.types";
import {
  decideUsage,
  hasAddOn,
  metricAllowance,
  resourceLimit,
} from "../../apps/web/src/lib/payments/billing-calculation";
import { METER_CATALOG } from "../../apps/web/src/lib/payments/billing-meter-catalog";
import { parseQuoteBillingTerms } from "../../apps/web/src/lib/payments/billing-quote-metadata";

function context(overrides: Partial<EntitlementContext> = {}): EntitlementContext {
  return {
    addOns: {},
    entitlementOverrides: {},
    isLimitExempt: false,
    overageRateOverrides: {},
    overagesEnabled: false,
    plan: "hobby",
    spendLimitCents: null,
    ...overrides,
  };
}

describe("billing entitlement decisions", () => {
  it("hard-stops Hobby usage above the included allowance", () => {
    const decision = decideUsage({
      context: context(),
      currentEstimatedCostCents: 0,
      metric: "edge_requests",
      quantity: 1n,
      used: 100_000n,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("Hobby");
  });

  it("requires Pro overage opt-in and meters package boundaries", () => {
    const disabled = context({ plan: "pro" });
    expect(
      decideUsage({
        context: disabled,
        currentEstimatedCostCents: 0,
        metric: "edge_requests",
        quantity: 1n,
        used: 1_000_000n,
      }).allowed,
    ).toBe(false);
    const enabled = { ...disabled, overagesEnabled: true };
    const firstPackage = decideUsage({
      context: enabled,
      currentEstimatedCostCents: 0,
      metric: "edge_requests",
      quantity: 1n,
      used: 1_000_000n,
    });
    expect(firstPackage.estimatedCostDeltaCents).toBe(100);
    expect(firstPackage.overageDelta).toBe(1n);
  });

  it("enforces the customer hard spend cap before accepting usage", () => {
    const decision = decideUsage({
      context: context({
        overagesEnabled: true,
        plan: "pro",
        spendLimitCents: 99,
      }),
      currentEstimatedCostCents: 0,
      metric: "edge_requests",
      quantity: 1n,
      used: 1_000_000n,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("spend limit");
  });

  it("adds Mail packages and developer-seat quantities to plan limits", () => {
    const pro = context({
      addOns: { developer_seat: 2, mail_volume: 3 },
      plan: "pro",
    });
    expect(metricAllowance(pro, "mail_email_units")).toBe(15_500n);
    expect(resourceLimit(pro, "developer_seats")).toBe(3);
  });

  it("bypasses resource, feature, and usage limits for whitelisted scopes", () => {
    const whitelisted = context({ isLimitExempt: true });
    expect(resourceLimit(whitelisted, "projects")).toBeNull();
    expect(metricAllowance(whitelisted, "edge_requests")).toBeNull();
    expect(hasAddOn(whitelisted, "observability_plus")).toBe(true);
    expect(
      decideUsage({
        context: whitelisted,
        currentEstimatedCostCents: 0,
        metric: "edge_requests",
        quantity: 1_000_000_000n,
        used: 1_000_000_000n,
      }),
    ).toMatchObject({
      allowed: true,
      estimatedCostDeltaCents: 0,
      overageDelta: 0n,
    });
  });

  it("applies negotiated Enterprise Quote metadata", () => {
    expect(
      parseQuoteBillingTerms({
        entitlement_overrides: '{"projects":75,"edge_requests":50000000}',
        overage_rate_overrides: '{"edge_requests":80}',
        overages_enabled: "true",
        spend_limit_cents: "250000",
      }),
    ).toEqual({
      entitlementOverrides: { edge_requests: 50_000_000, projects: 75 },
      overageRateOverrides: { edge_requests: 80 },
      overagesEnabled: true,
      spendAlertCents: undefined,
      spendLimitCents: 250_000,
    });
  });

  it("keeps backend allowances and billing units aligned with the pricing table", () => {
    const gibHourMbMs = 1024n * 3_600_000n;
    expect(METER_CATALOG.edge_config_writes).toMatchObject({
      hobbyAllowance: 1_000n,
      proAllowance: 10_000n,
      unitPriceCents: 1_200,
      unitSize: 1_000_000n,
    });
    expect(METER_CATALOG.function_memory_mb_ms).toMatchObject({
      hobbyAllowance: gibHourMbMs,
      proAllowance: 8n * gibHourMbMs,
      unitPriceCents: 2.5,
      unitSize: gibHourMbMs,
    });
    expect(METER_CATALOG.sandbox_memory_mb_ms).toMatchObject({
      hobbyAllowance: gibHourMbMs,
      proAllowance: 4n * gibHourMbMs,
      unitPriceCents: 2.5,
      unitSize: gibHourMbMs,
    });
    expect(METER_CATALOG.sandbox_creations).toMatchObject({
      hobbyAllowance: 5n,
      proAllowance: 25n,
      unitPriceCents: 100,
      unitSize: 100n,
    });
    expect(METER_CATALOG.workflow_events).toMatchObject({
      hobbyAllowance: 10_000n,
      proAllowance: 100_000n,
      unitPriceCents: 200,
      unitSize: 100_000n,
    });
  });

  it("accumulates fractional-cent catalog rates without underbilling", () => {
    const gibHourMbMs = 1024n * 3_600_000n;
    const enabled = context({ overagesEnabled: true, plan: "pro" });
    const first = decideUsage({
      context: enabled,
      currentEstimatedCostCents: 0,
      metric: "function_memory_mb_ms",
      quantity: gibHourMbMs,
      used: 8n * gibHourMbMs,
    });
    const second = decideUsage({
      context: enabled,
      currentEstimatedCostCents: first.estimatedCostDeltaCents,
      metric: "function_memory_mb_ms",
      quantity: gibHourMbMs,
      used: 9n * gibHourMbMs,
    });
    expect(first.estimatedCostDeltaCents).toBe(3);
    expect(second.estimatedCostDeltaCents).toBe(2);
    expect(first.estimatedCostDeltaCents + second.estimatedCostDeltaCents).toBe(5);
  });
});
