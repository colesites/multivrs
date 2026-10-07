import type { Db } from "../../db/client";
import { toCurrency, toMinor, toUnix } from "../../db/convert";
import type {
  Feature as FeatureRow,
  Plan as PlanRow,
  Price as PriceRow,
} from "../../generated/prisma/client";
import type { Feature, Plan, Price } from "../../services/catalog.types";
import { toFeatureValues, toPlanExtras } from "../../services/feature-values";
import type { CatalogStore } from "../catalog.store";

function featureFromRow(row: FeatureRow): Feature {
  const { id, key, name, type } = row;
  return {
    id,
    object: "feature",
    livemode: row.mode === "live",
    key,
    name,
    type,
    created: toUnix(row.createdAt),
  };
}

function priceFromRow(row: PriceRow): Price {
  return {
    id: row.id,
    object: "price",
    livemode: row.mode === "live",
    plan: row.planId,
    interval: row.interval,
    interval_count: row.intervalCount,
    currency: toCurrency(row.currency).toLowerCase(),
    amount: toMinor(row.amount),
    active: row.active,
    created: toUnix(row.createdAt),
  };
}

function planFromRow(row: PlanRow & { prices: PriceRow[] }): Plan {
  return {
    id: row.id,
    object: "plan",
    livemode: row.mode === "live",
    key: row.key,
    name: row.name,
    description: row.description,
    payer: row.payer,
    trial_days: row.trialDays,
    features: toFeatureValues(row.features),
    ...toPlanExtras(row),
    active: row.active,
    source: row.source,
    prices: row.prices.map(priceFromRow),
    created: toUnix(row.createdAt),
  };
}

export function createPrismaCatalogStore(db: Db): CatalogStore {
  return {
    async load({ merchantId, mode }) {
      const [features, plans] = await Promise.all([
        db.feature.findMany({ where: { merchantId, mode }, orderBy: { createdAt: "asc" } }),
        db.plan.findMany({
          where: { merchantId, mode },
          include: { prices: { orderBy: { createdAt: "asc" } } },
          orderBy: { createdAt: "asc" },
        }),
      ]);
      return { features: features.map(featureFromRow), plans: plans.map(planFromRow) };
    },
    async apply({ merchantId, mode }, changes) {
      await db.$transaction(async (tx) => {
        await tx.feature.deleteMany({
          where: { id: { in: changes.deleteFeatureIds }, merchantId },
        });
        for (const f of changes.upsertFeatures) {
          const data = { key: f.key, name: f.name, type: f.type };
          await tx.feature.upsert({
            where: { id: f.id },
            create: { id: f.id, merchantId, mode, ...data, createdAt: new Date(f.created * 1000) },
            update: data,
          });
        }
        for (const p of changes.upsertPlans) {
          const data = {
            key: p.key,
            name: p.name,
            description: p.description,
            payer: p.payer,
            trialDays: p.trial_days,
            features: p.features,
            images: p.images,
            marketingFeatures: p.marketing_features.map(({ name }) => ({ name })),
            metadata: p.metadata,
            active: p.active,
            source: p.source,
          };
          await tx.plan.upsert({
            where: { id: p.id },
            create: { id: p.id, merchantId, mode, ...data, createdAt: new Date(p.created * 1000) },
            update: data,
          });
        }
        await tx.price.updateMany({
          where: { id: { in: changes.deactivatePriceIds }, merchantId },
          data: { active: false },
        });
        await tx.price.updateMany({
          where: { id: { in: changes.activatePriceIds }, merchantId },
          data: { active: true },
        });
        // A price takes its plan's source; the plan may be new in this same change set.
        const sources = new Map(changes.upsertPlans.map((p) => [p.id, p.source]));
        const unknown = changes.createPrices.map((p) => p.plan).filter((id) => !sources.has(id));
        if (unknown.length > 0) {
          const rows = await tx.plan.findMany({
            where: { id: { in: unknown }, merchantId },
            select: { id: true, source: true },
          });
          for (const row of rows) sources.set(row.id, row.source);
        }
        await tx.price.createMany({
          data: changes.createPrices.map((p) => ({
            id: p.id,
            merchantId,
            mode,
            planId: p.plan,
            interval: p.interval,
            intervalCount: p.interval_count,
            currency: p.currency.toUpperCase(),
            amount: BigInt(p.amount),
            source: sources.get(p.plan) ?? "config",
            createdAt: new Date(p.created * 1000),
          })),
        });
      });
    },
  };
}
