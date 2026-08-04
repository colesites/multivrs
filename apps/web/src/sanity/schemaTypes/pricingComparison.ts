import { BillIcon } from "@sanity/icons/Bill";
import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { ComponentIcon } from "@sanity/icons/Component";
import { ControlsIcon } from "@sanity/icons/Controls";
import { TagIcon } from "@sanity/icons/Tag";
import { defineArrayMember, defineField, defineType } from "sanity";
import { recommendedPricingComparisonInitialValue } from "../seed/recommended-pricing-comparison";

const planOptions = [
  { title: "Hobby", value: "hobby" },
  { title: "Pro", value: "pro" },
  { title: "Enterprise", value: "enterprise" },
];

const availabilityOptions = [
  { title: "Included", value: "included" },
  { title: "Not included", value: "excluded" },
  { title: "Text or limit", value: "text" },
  { title: "Custom", value: "custom" },
  { title: "Coming soon", value: "comingSoon" },
];

const implementationOptions = [
  { title: "Generally available", value: "available" },
  { title: "Preview", value: "preview" },
  { title: "Requires infrastructure", value: "infrastructureRequired" },
];

export const pricingPlanType = defineType({
  name: "pricingPlan",
  title: "Plan column",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({
      name: "key",
      title: "Plan",
      type: "string",
      options: { list: planOptions, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Display name",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "key" },
  },
});

export const pricingPlanValueType = defineType({
  name: "pricingPlanValue",
  title: "Plan value",
  type: "object",
  icon: ControlsIcon,
  fields: [
    defineField({
      name: "planKey",
      title: "Plan",
      type: "string",
      options: { list: planOptions, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Value type",
      type: "string",
      options: { list: availabilityOptions, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "value",
      title: "Primary text",
      type: "string",
      description:
        "Use for limits, prices, or a more specific Coming soon/Custom label.",
      hidden: ({ parent }) =>
        parent?.kind === "included" || parent?.kind === "excluded",
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: "note",
      title: "Secondary text",
      type: "string",
      description: "For example: then $1 per additional 1M.",
      hidden: ({ parent }) =>
        parent?.kind === "included" || parent?.kind === "excluded",
      validation: (rule) => rule.max(140),
    }),
  ],
  preview: {
    select: { kind: "kind", plan: "planKey", value: "value" },
    prepare({ kind, plan, value }) {
      return {
        title: plan,
        subtitle: value || kind,
      };
    },
  },
});

export const pricingFeatureType = defineType({
  name: "pricingFeature",
  title: "Feature row",
  type: "object",
  icon: ComponentIcon,
  fields: [
    defineField({
      name: "name",
      title: "Feature name",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Explanation",
      type: "text",
      rows: 2,
      description: "Shown through the information control in the table.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "implementationStatus",
      title: "Internal implementation status",
      type: "string",
      description:
        "Editorial readiness metadata only. It is not rendered on the public pricing table.",
      options: { list: implementationOptions, layout: "radio" },
      initialValue: "available",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "values",
      title: "Plan values",
      type: "array",
      of: [defineArrayMember({ type: "pricingPlanValue" })],
      validation: (rule) =>
        rule
          .required()
          .min(3)
          .max(3)
          .custom((values) => {
            if (!values) return true;
            const keys = values.flatMap((value) => {
              const key = (value as { planKey?: string })?.planKey;
              return key ? [key] : [];
            });
            return (
              new Set(keys).size === keys.length || "Each plan can appear once."
            );
          }),
    }),
  ],
  preview: {
    select: { status: "implementationStatus", title: "name" },
    prepare({ status, title }) {
      return { title, subtitle: status };
    },
  },
});

export const pricingFeatureGroupType = defineType({
  name: "pricingFeatureGroup",
  title: "Feature group",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Group name",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Group description",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "features",
      title: "Sub-features",
      type: "array",
      of: [defineArrayMember({ type: "pricingFeature" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", features: "features" },
    prepare({ features, title }) {
      return {
        title,
        subtitle: `${Array.isArray(features) ? features.length : 0} feature rows`,
      };
    },
  },
});

export const pricingSectionType = defineType({
  name: "pricingSection",
  title: "Pricing table",
  type: "object",
  icon: BillIcon,
  fields: [
    defineField({
      name: "slug",
      title: "Stable key",
      type: "slug",
      options: { source: "title", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Table name",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Table description",
      type: "string",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "items",
      title: "Groups and standalone features",
      type: "array",
      description:
        "Use a Feature group when a main feature owns sub-features. Use a Feature row for standalone entries such as Edge Requests.",
      of: [
        defineArrayMember({ type: "pricingFeatureGroup" }),
        defineArrayMember({ type: "pricingFeature" }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { description: "description", title: "title" },
    prepare({ description, title }) {
      return { title, subtitle: description };
    },
  },
});

export const pricingComparisonType = defineType({
  name: "pricingComparison",
  title: "Pricing comparison",
  description:
    "Editable public presentation. Stripe and the executable billing catalog remain the charging and enforcement source of truth.",
  type: "document",
  icon: BillIcon,
  initialValue: recommendedPricingComparisonInitialValue,
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: "description",
      title: "Introduction",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      initialValue: "Search features…",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "plans",
      title: "Plan columns",
      type: "array",
      of: [defineArrayMember({ type: "pricingPlan" })],
      validation: (rule) =>
        rule
          .required()
          .min(3)
          .max(3)
          .custom((plans) => {
            if (!plans) return true;
            const keys = plans.flatMap((plan) => {
              const key = (plan as { key?: string })?.key;
              return key ? [key] : [];
            });
            return (
              new Set(keys).size === keys.length || "Each plan can appear once."
            );
          }),
    }),
    defineField({
      name: "sections",
      title: "Pricing tables",
      type: "array",
      of: [defineArrayMember({ type: "pricingSection" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", sections: "sections" },
    prepare({ sections, title }) {
      return {
        title,
        subtitle: `${Array.isArray(sections) ? sections.length : 0} pricing tables`,
      };
    },
  },
});
