import type { Db } from "../../db/client";
import { toUnix } from "../../db/convert";
import type { OnboardingStore } from "../onboarding.store";

const dateOrNull = (seconds: number | null) => (seconds === null ? null : new Date(seconds * 1000));

export function createPrismaOnboardingStore(db: Db): OnboardingStore {
  return {
    async get(merchantId) {
      const row = await db.merchantOnboarding.findUnique({ where: { merchantId } });
      if (!row) return null;
      const { updatedAt: _, submittedAt, reviewedAt, identityCheckedAt, ...fields } = row;
      return {
        ...fields,
        submittedAt: submittedAt ? toUnix(submittedAt) : null,
        reviewedAt: reviewedAt ? toUnix(reviewedAt) : null,
        identityCheckedAt: identityCheckedAt ? toUnix(identityCheckedAt) : null,
      };
    },
    async save({ merchantId, submittedAt, reviewedAt, identityCheckedAt, ...fields }) {
      const data = {
        ...fields,
        submittedAt: dateOrNull(submittedAt),
        reviewedAt: dateOrNull(reviewedAt),
        identityCheckedAt: dateOrNull(identityCheckedAt),
      };
      await db.merchantOnboarding.upsert({
        where: { merchantId },
        create: { merchantId, ...data },
        update: data,
      });
    },
  };
}
