const PRICING_PLAN_KEYS = ["hobby", "pro", "enterprise"] as const;

export type PricingPlanKey = (typeof PRICING_PLAN_KEYS)[number];

export type PricingImplementationStatus =
  | "available"
  | "preview"
  | "infrastructureRequired";

export type PricingValueKind =
  | "included"
  | "excluded"
  | "text"
  | "custom"
  | "comingSoon";

export type PricingPlan = {
  _key: string;
  _type: "pricingPlan";
  description?: string;
  key: PricingPlanKey;
  name: string;
};

export type PricingPlanValue = {
  _key: string;
  _type: "pricingPlanValue";
  kind: PricingValueKind;
  note?: string;
  planKey: PricingPlanKey;
  value?: string;
};

export type PricingFeature = {
  _key: string;
  _type: "pricingFeature";
  description?: string;
  implementationStatus: PricingImplementationStatus;
  name: string;
  values: PricingPlanValue[];
};

export type PricingFeatureGroup = {
  _key: string;
  _type: "pricingFeatureGroup";
  description?: string;
  features: PricingFeature[];
  title: string;
};

export type PricingSectionItem = PricingFeature | PricingFeatureGroup;

export type PricingSection = {
  _key: string;
  _type: "pricingSection";
  description: string;
  items: PricingSectionItem[];
  slug: { current: string };
  title: string;
};

export type PricingComparison = {
  _id: string;
  _type: "pricingComparison";
  description: string;
  plans: PricingPlan[];
  searchPlaceholder: string;
  sections: PricingSection[];
  title: string;
};
