import type { Product } from "../types";

/** "14-day trial · custom_domains, seats: 5" for a config plan. */
export function configSummary({ trial_days, features }: Product): string {
  const trial = trial_days > 0 ? `${trial_days}-day trial` : "No trial";
  const list = Object.entries(features).map(([key, value]) =>
    typeof value === "number"
      ? `${key}: ${value}`
      : value
        ? key
        : `${key}: off`,
  );
  return [trial, list.join(", ") || "no features"].join(" · ");
}
