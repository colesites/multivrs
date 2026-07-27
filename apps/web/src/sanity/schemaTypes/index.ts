import type { SchemaTypeDefinition } from "sanity";
import { faqType } from "./faq";
import { faqCategoryType } from "./faqCategory";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [faqType, faqCategoryType],
};
