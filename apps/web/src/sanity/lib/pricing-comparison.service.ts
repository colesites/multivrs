import { cacheLife, cacheTag } from "next/cache";
import { logWarning } from "@/lib/services/logger.service";
import { recommendedPricingComparison } from "../seed/recommended-pricing-comparison";
import { client } from "./client";
import type { PricingComparison } from "./pricing-comparison.types";
import { pricingComparisonQuery } from "./queries";

function isUsableComparison(
  comparison: PricingComparison | null,
): comparison is PricingComparison {
  return Boolean(
    comparison?.plans?.length &&
      comparison.sections?.length &&
      comparison.title?.trim(),
  );
}

function withRequiredPricingSections(
  comparison: PricingComparison,
): PricingComparison {
  const existing = new Map(
    comparison.sections.map((section) => [section.slug.current, section]),
  );
  const knownSlugs = new Set(
    recommendedPricingComparison.sections.map(
      (section) => section.slug.current,
    ),
  );
  const sections = recommendedPricingComparison.sections.map(
    (section) => existing.get(section.slug.current) ?? section,
  );
  sections.push(
    ...comparison.sections.filter(
      (section) => !knownSlugs.has(section.slug.current),
    ),
  );

  return {
    ...comparison,
    description: comparison.description.includes("Mail is priced separately")
      ? recommendedPricingComparison.description
      : comparison.description,
    sections,
  };
}

export async function getPricingComparison(): Promise<PricingComparison> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag("pricing", "pricing-comparison");

  try {
    const comparison = await client.fetch<PricingComparison | null>(
      pricingComparisonQuery,
    );
    return isUsableComparison(comparison)
      ? withRequiredPricingSections(comparison)
      : recommendedPricingComparison;
  } catch (error) {
    logWarning("sanity.pricing.fetch_failed", error);
    return recommendedPricingComparison;
  }
}
