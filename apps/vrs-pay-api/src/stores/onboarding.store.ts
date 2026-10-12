import type { OnboardingRecord } from "../services/onboarding.types";

export interface OnboardingStore {
  get(merchantId: string): Promise<OnboardingRecord | null>;
  /** Creates or replaces the merchant's onboarding record. */
  save(record: OnboardingRecord): Promise<void>;
  /** Merchants who have saved a bank account to be paid into. */
  withPayoutAccount(): Promise<string[]>;
}
