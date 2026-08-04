import type { MetricDefinition } from "@/lib/payments/billing.types";

export function meter(
  suffix: string,
  hobbyAllowance: bigint,
  proAllowance: bigint,
  unitSize: bigint,
  unitPriceCents: number,
): MetricDefinition {
  return {
    eventName: `multivrs_${suffix}`,
    hobbyAllowance,
    proAllowance,
    unitPriceCents,
    unitSize,
  };
}
