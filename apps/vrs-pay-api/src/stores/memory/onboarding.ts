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
  };
}
