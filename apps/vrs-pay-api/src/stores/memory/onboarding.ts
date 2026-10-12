import type { OnboardingRecord } from "../../services/onboarding.types";
import type { OnboardingStore } from "../onboarding.store";

export function createMemoryOnboardingStore(
  records = new Map<string, OnboardingRecord>(),
): OnboardingStore {
  return {
    async get(merchantId) {
      return records.get(merchantId) ?? null;
    },
    async save(record) {
      records.set(record.merchantId, record);
    },
    async withPayoutAccount() {
      return [...records.values()].filter((r) => r.payoutDetails).map((r) => r.merchantId);
    },
  };
}
