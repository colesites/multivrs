import { newId } from "@vrs-pay/core";
import type { BillingConfig } from "../routes/billing-config.schema";
import { type Catalog, type CatalogChanges, NO_EXTRAS, type Plan } from "./catalog.types";
import { catalogChanges, nameFromKey, newPrice, samePlan, slotsOf } from "./catalog-compare";

export interface CatalogDiff {
  changes: CatalogChanges;
  summary: { created: string[]; updated: string[]; archived: string[] };
}

/**
 * Works out what a sync changes. Config is the source of truth: missing
 * plans are archived (subscribers keep them), changed amounts become new
 * prices, and running the same config twice changes nothing. Products made
 * in the dashboard are never touched.
 */
export function diffCatalog(
  current: Catalog,
  config: BillingConfig,
  livemode: boolean,
  now: number,
): CatalogDiff {
  const changes = catalogChanges();
  const summary: CatalogDiff["summary"] = { created: [], updated: [], archived: [] };
  const synced = current.plans.filter((p) => p.source === "config");

  for (const [key, { type, name = nameFromKey(key) }] of Object.entries(config.features)) {
    const existing = current.features.find((f) => f.key === key);
    if (!existing) {
      changes.upsertFeatures.push({
        id: newId("feature"),
        object: "feature",
        livemode,
        key,
        name,
        type,
        created: now,
      });
      summary.created.push(`feature ${key}`);
    } else if (existing.name !== name || existing.type !== type) {
      changes.upsertFeatures.push({ ...existing, name, type });
      summary.updated.push(`feature ${key}`);
    }
  }
  for (const feature of current.features) {
    if (!(feature.key in config.features)) {
      changes.deleteFeatureIds.push(feature.id);
      summary.archived.push(`feature ${feature.key}`);
    }
  }

  for (const [key, spec] of Object.entries(config.plans)) {
    const existing = synced.find((p) => p.key === key);
    const plan: Plan = {
      id: existing?.id ?? newId("plan"),
      object: "plan",
      livemode,
      key,
      name: spec.name,
      description: spec.description ?? null,
      payer: spec.payer,
      trial_days: spec.trial_days,
      features: spec.features,
      ...NO_EXTRAS,
      active: true,
      source: "config",
      prices: [],
      created: existing?.created ?? now,
    };
    if (!existing || !samePlan(existing, plan)) {
      changes.upsertPlans.push(plan);
      summary[existing ? "updated" : "created"].push(`plan ${key}`);
    }
    const active = existing?.prices.filter((p) => p.active) ?? [];
    const slots = slotsOf(spec.prices);
    for (const slot of slots) {
      const label = `price ${key} ${slot.interval} ${slot.currency} ${slot.amount}`;
      const match = active.find(
        (p) => p.interval === slot.interval && p.currency === slot.currency.toLowerCase(),
      );
      if (match?.amount === slot.amount) continue;
      if (match) changes.deactivatePriceIds.push(match.id);
      changes.createPrices.push(newPrice(plan.id, slot, livemode, now));
      summary.created.push(label);
    }
    for (const price of active) {
      const kept = slots.some(
        (s) => s.interval === price.interval && s.currency.toLowerCase() === price.currency,
      );
      if (!kept) {
        changes.deactivatePriceIds.push(price.id);
        summary.archived.push(
          `price ${key} ${price.interval} ${price.currency.toUpperCase()} ${price.amount}`,
        );
      }
    }
  }

  for (const plan of synced) {
    if (plan.key in config.plans || !plan.active) continue;
    changes.upsertPlans.push({ ...plan, active: false });
    changes.deactivatePriceIds.push(...plan.prices.filter((p) => p.active).map((p) => p.id));
    summary.archived.push(`plan ${plan.key}`);
  }
  return { changes, summary };
}
