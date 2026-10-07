import { z } from "zod";
import type { FeatureValue } from "./catalog.types";

const FeatureValuesSchema = z.record(z.string(), z.union([z.boolean(), z.int().min(0)]));

/** Stored plan features are a flat map of feature key → true or a limit. */
export function toFeatureValues(value: unknown): Record<string, FeatureValue> {
  return FeatureValuesSchema.parse(value);
}
