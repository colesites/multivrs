export interface PricingRule {
  marginPercent: number;
  minimumMargin: number;
}

export type DomainPriceOperation = "create" | "renew" | "transfer";

const PRICE_OVERRIDES: Record<
  string,
  Partial<Record<DomainPriceOperation, number>>
> = {
  com: { create: 14, renew: 19.99 },
};

export const DEFAULT_PRICING_RULE: PricingRule = {
  marginPercent: 0.18,
  minimumMargin: 2.5,
};

export function roundTo99(value: number): number {
  return Math.max(0.99, Math.ceil(value) - 0.01);
}

export function retailPrice(cost: number, rule = DEFAULT_PRICING_RULE): number {
  const proportional = cost * (1 + rule.marginPercent);
  return roundTo99(Math.max(proportional, cost + rule.minimumMargin));
}

export function domainRetailPrice(
  extension: string,
  operation: DomainPriceOperation,
  wholesaleCost: number,
): number {
  return PRICE_OVERRIDES[extension]?.[operation] ?? retailPrice(wholesaleCost);
}
