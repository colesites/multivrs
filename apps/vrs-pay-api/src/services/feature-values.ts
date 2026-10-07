import { z } from "zod";
import type { FeatureValue } from "./catalog.types";

const FeatureValuesSchema = z.record(z.string(), z.union([z.boolean(), z.int().min(0)]));
const ImagesSchema = z.array(z.string());
const MarketingFeaturesSchema = z.array(z.object({ name: z.string() }));
const MetadataSchema = z.record(z.string(), z.string());

/** Stored plan features are a flat map of feature key → true or a limit. */
export function toFeatureValues(value: unknown): Record<string, FeatureValue> {
  return FeatureValuesSchema.parse(value);
}

/** Stored product extras: image URLs, marketing features and metadata. */
export function toPlanExtras(row: { images: unknown; marketingFeatures: unknown; metadata: unknown }) {
  return {
    images: ImagesSchema.parse(row.images),
    marketing_features: MarketingFeaturesSchema.parse(row.marketingFeatures),
    metadata: MetadataSchema.parse(row.metadata),
  };
}
