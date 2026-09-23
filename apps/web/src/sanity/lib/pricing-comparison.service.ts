import { cacheTag } from "next/cache";
import { logWarning } from "@/lib/services/logger.service";
import { recommendedPricingComparison } from "../seed/recommended-pricing-comparison";
import { type DynamicFetchOptions, sanityFetch } from "./live";
import type { PricingComparison } from "./pricing-comparison.types";
import { pricingComparisonQuery } from "./queries";

function isUsableComparison(
  comparison: unknown,
): comparison is PricingComparison {
  const candidate = comparison as Partial<PricingComparison> | null | undefined;
  return Boolean(
    candidate?.plans?.length &&
      candidate?.sections?.length &&
      candidate?.title?.trim(),
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

export async function getPricingComparison(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<PricingComparison> {
  try {
    const { data: comparison } = await sanityFetch({
      query: pricingComparisonQuery,
      perspective: options.perspective,
      stega: options.stega,
    });
    return isUsableComparison(comparison)
      ? withRequiredPricingSections(comparison)
      : recommendedPricingComparison;
  } catch (error) {
    logWarning("sanity.pricing.fetch_failed", error);
    return recommendedPricingComparison;
  }
}

export const PRICING_COMPARISON_TAG = "pricing:comparison";

/**
 * The published comparison table, cached so the pricing route can prerender.
 * Sanity Live tags the query inside this boundary, so edits still appear
 * without waiting for the lifetime to lapse.
 */
export async function getCachedPricingComparison(): Promise<PricingComparison> {
  "use cache";
  cacheTag(PRICING_COMPARISON_TAG);
  return getPricingComparison();
}
