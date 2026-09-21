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
import { templateType } from "./template";
import { templateCategoryType } from "./templateCategory";
import { templateStackType } from "./templateStack";

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
    templateType,
    templateCategoryType,
    templateStackType,
  ],
};
