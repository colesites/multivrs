export interface LabelValuePair {
  label: string;
  value: string;
}

export interface SectionCard {
  title: string;
  description: string;
}

export interface PricingPlan extends SectionCard {
  price: string;
  cta: string;
}
