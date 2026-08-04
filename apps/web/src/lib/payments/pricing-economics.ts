export type MeterRate = {
  providerCostUsd: number;
  retailPriceUsd: number;
  unit: string;
};

/**
 * Public provider rates reviewed on 2026-08-01. These are conservative cost
 * floors: container egress uses Cloudflare's most expensive published region,
 * and Analytics Engine includes its announced future pricing.
 */
export const RECOMMENDED_METER_RATES = {
  analyticsQueries: {
    providerCostUsd: 1,
    retailPriceUsd: 3,
    unit: "1M queries",
  },
  analyticsWrites: {
    providerCostUsd: 0.25,
    retailPriceUsd: 0.75,
    unit: "1M events",
  },
  containerCpu: {
    providerCostUsd: 0.072,
    retailPriceUsd: 0.18,
    unit: "vCPU-hour",
  },
  containerEgress: {
    providerCostUsd: 0.05,
    retailPriceUsd: 0.1,
    unit: "GB",
  },
  containerMemory: {
    providerCostUsd: 0.009,
    retailPriceUsd: 0.025,
    unit: "GiB-hour",
  },
  edgeRequests: {
    providerCostUsd: 0.3,
    retailPriceUsd: 1,
    unit: "1M requests",
  },
  imageTransformations: {
    providerCostUsd: 0.5,
    retailPriceUsd: 1,
    unit: "1K transformations",
  },
  kvReads: {
    providerCostUsd: 0.5,
    retailPriceUsd: 1.5,
    unit: "1M reads",
  },
  kvWrites: {
    providerCostUsd: 5,
    retailPriceUsd: 12,
    unit: "1M writes",
  },
  queueOperations: {
    providerCostUsd: 0.4,
    retailPriceUsd: 1,
    unit: "1M operations",
  },
  resendMessages: {
    providerCostUsd: 0.9,
    retailPriceUsd: 2,
    unit: "1K sent or received emails",
  },
  r2ClassA: {
    providerCostUsd: 4.5,
    retailPriceUsd: 10,
    unit: "1M operations",
  },
  r2ClassB: {
    providerCostUsd: 0.36,
    retailPriceUsd: 1,
    unit: "1M operations",
  },
  r2Storage: {
    providerCostUsd: 0.015,
    retailPriceUsd: 0.04,
    unit: "GB-month",
  },
  saasHostname: {
    providerCostUsd: 0.1,
    retailPriceUsd: 0.25,
    unit: "hostname-month",
  },
  workflowSteps: {
    providerCostUsd: 0.8,
    retailPriceUsd: 2,
    unit: "100K steps",
  },
  workflowStorage: {
    providerCostUsd: 0.2,
    retailPriceUsd: 0.5,
    unit: "GB-month",
  },
  workersCpu: {
    providerCostUsd: 0.02,
    retailPriceUsd: 0.06,
    unit: "1M CPU milliseconds",
  },
} as const satisfies Record<string, MeterRate>;

function grossMargin(rate: MeterRate): number {
  return (rate.retailPriceUsd - rate.providerCostUsd) / rate.retailPriceUsd;
}

export function dollars(amount: number): string {
  return `$${amount.toFixed(amount < 1 ? 2 : Number.isInteger(amount) ? 0 : 2)}`;
}

const proAllowanceCosts = {
  analyticsWrites: RECOMMENDED_METER_RATES.analyticsWrites.providerCostUsd,
  containerCpu: RECOMMENDED_METER_RATES.containerCpu.providerCostUsd * 2,
  containerEgress: RECOMMENDED_METER_RATES.containerEgress.providerCostUsd * 50,
  containerMemory: RECOMMENDED_METER_RATES.containerMemory.providerCostUsd * 8,
  edgeRequests: RECOMMENDED_METER_RATES.edgeRequests.providerCostUsd,
  imageTransformations:
    RECOMMENDED_METER_RATES.imageTransformations.providerCostUsd,
  kvReads: RECOMMENDED_METER_RATES.kvReads.providerCostUsd,
  kvWrites: RECOMMENDED_METER_RATES.kvWrites.providerCostUsd * 0.01,
  // Resend Pro averages $0.40/1K across its included 50K allowance. Multivrs
  // includes 500 email units in Pro and prices additional units at the
  // conservative Resend overage floor above.
  mailMessages: 0.2,
  queueOperations:
    RECOMMENDED_METER_RATES.queueOperations.providerCostUsd * 0.3,
  r2ClassA: RECOMMENDED_METER_RATES.r2ClassA.providerCostUsd * 0.1,
  r2ClassB: RECOMMENDED_METER_RATES.r2ClassB.providerCostUsd,
  r2Storage: RECOMMENDED_METER_RATES.r2Storage.providerCostUsd * 5,
  saasHostnames: RECOMMENDED_METER_RATES.saasHostname.providerCostUsd * 5,
  workflowSteps: RECOMMENDED_METER_RATES.workflowSteps.providerCostUsd,
  workersCpu: RECOMMENDED_METER_RATES.workersCpu.providerCostUsd * 7,
} as const;

const RECOMMENDED_MAIL_ADD_ON_ECONOMICS = {
  includedMessages: 5_000,
  monthlyPriceUsd: 10,
  providerCostUsd: RECOMMENDED_METER_RATES.resendMessages.providerCostUsd * 5,
} as const;

const RECOMMENDED_PRO_ECONOMICS = {
  monthlyPriceUsd: 20,
  conservativeProviderCostUsd: Object.values(proAllowanceCosts).reduce(
    (total, cost) => total + cost,
    0,
  ),
  platformReserveUsd: 2,
  processorReserveRate: 0.05,
} as const;

function proContributionMargin(): number {
  const processorReserve =
    RECOMMENDED_PRO_ECONOMICS.monthlyPriceUsd *
    RECOMMENDED_PRO_ECONOMICS.processorReserveRate;
  return (
    (RECOMMENDED_PRO_ECONOMICS.monthlyPriceUsd -
      RECOMMENDED_PRO_ECONOMICS.conservativeProviderCostUsd -
      RECOMMENDED_PRO_ECONOMICS.platformReserveUsd -
      processorReserve) /
    RECOMMENDED_PRO_ECONOMICS.monthlyPriceUsd
  );
}

export const RECOMMENDED_PLAN_ECONOMICS = {
  mailAddOn: RECOMMENDED_MAIL_ADD_ON_ECONOMICS,
  minimumMeterGrossMargin: Math.min(
    ...Object.values(RECOMMENDED_METER_RATES).map(grossMargin),
  ),
  pro: RECOMMENDED_PRO_ECONOMICS,
  proContributionMargin: proContributionMargin(),
} as const;
