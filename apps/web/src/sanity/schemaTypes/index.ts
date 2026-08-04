import type { SchemaTypeDefinition } from "sanity";
import { faqType } from "./faq";
import { faqCategoryType } from "./faqCategory";
import {
  pricingComparisonType,
  pricingFeatureGroupType,
  pricingFeatureType,
  pricingPlanType,
  pricingPlanValueType,
  pricingSectionType,
} from "./pricingComparison";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    faqType,
    faqCategoryType,
    pricingPlanType,
    pricingPlanValueType,
    pricingFeatureType,
    pricingFeatureGroupType,
    pricingSectionType,
    pricingComparisonType,
  ],
};
