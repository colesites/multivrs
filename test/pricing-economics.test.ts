import { describe, expect, it } from "bun:test";
import { RECOMMENDED_PLAN_ECONOMICS } from "../apps/web/src/lib/payments/pricing-economics";

describe("recommended pricing economics", () => {
  it("keeps every published infrastructure overage at or above 50% gross margin", () => {
    expect(RECOMMENDED_PLAN_ECONOMICS.minimumMeterGrossMargin).toBeGreaterThanOrEqual(0.5);
  });

  it("keeps the conservative Pro allowance below the monthly plan price", () => {
    expect(RECOMMENDED_PLAN_ECONOMICS.pro.conservativeProviderCostUsd).toBeLessThan(
      RECOMMENDED_PLAN_ECONOMICS.pro.monthlyPriceUsd,
    );
    expect(RECOMMENDED_PLAN_ECONOMICS.proContributionMargin).toBeGreaterThanOrEqual(0.5);
  });

  it("keeps the recommended Mail add-on profitable at full included usage", () => {
    const mail = RECOMMENDED_PLAN_ECONOMICS.mailAddOn;
    const margin = (mail.monthlyPriceUsd - mail.providerCostUsd) / mail.monthlyPriceUsd;
    expect(margin).toBeGreaterThanOrEqual(0.5);
  });
});
