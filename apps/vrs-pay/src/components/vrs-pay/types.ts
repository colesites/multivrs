import type { ReactNode } from "react";

export interface PricingPrice {
  id: string;
  amount: number;
  currency: string;
  currency_options: Record<string, { amount: number }>;
  interval: "month" | "year" | "one_time" | string;
  interval_count: number;
  usage_type: "licensed" | "metered" | string;
  lookup_key: string | null;
}

export interface PricingProduct {
  id: string;
  object?: string;
  name: string;
  description: string | null;
  images: string[];
  marketing_features: Array<{ name: string }>;
  trial_days: number;
  features: Record<string, unknown>;
  prices: PricingPrice[];
}

export interface ComparisonPlan {
  id: string;
  name: string;
  price?: string;
  period?: string;
  description?: string;
  badge?: string;
  ctaText?: string;
  highlighted?: boolean;
  disabled?: boolean;
}

export interface ComparisonFeatureRow {
  name: string;
  description?: string;
  tooltip?: string;
  values: Record<string, boolean | string | number | ReactNode>;
}

export interface ComparisonSection {
  title: string;
  description?: string;
  rows: ComparisonFeatureRow[];
}
