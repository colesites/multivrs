/**
 * vrs-pay-api — POST /v1/billing/sync and the plan catalog: plans as code,
 * idempotent syncs, immutable prices, archiving and validation.
 */
import { describe, expect, test } from "bun:test";
import { harness } from "./harness";

const CONFIG = {
  features: { custom_domains: "boolean", seats: { type: "limit", name: "Team seats" } },
  plans: {
    free: { name: "Free", features: { seats: 1 } },
    pro: {
      name: "Pro",
      trial_days: 14,
      features: { custom_domains: true, seats: 5 },
      prices: { month: { gbp: 900, USD: 1000, NGN: 1_500_000 }, year: { GBP: 9000 } },
    },
  },
};

async function synced(config: object = CONFIG) {
  const h = await harness();
  const sync = (body: object) => h.call("/v1/billing/sync", { body });
  const first = await (await sync(config)).json();
  return { ...h, sync, first };
}

describe("POST /v1/billing/sync", () => {
  test("creates features, plans and one price per interval and currency", async () => {
    const { call, first } = await synced();
    expect(first.changed).toBe(true);
    expect(first.created).toEqual(
      expect.arrayContaining(["feature seats", "plan pro", "price pro month NGN 1500000"]),
    );
    expect(first.features.map((f: { name: string }) => f.name)).toEqual([
      "Custom domains",
      "Team seats",
    ]);
    const pro = await (await call("/v1/plans/pro")).json();
    expect(pro).toMatchObject({
      object: "plan",
      key: "pro",
      trial_days: 14,
      payer: "user",
      features: { seats: 5 },
    });
    expect(pro.id).toMatch(/^plan_/);
    const prices = pro.prices.map(
      (p: { interval: string; currency: string; amount: number }) =>
        `${p.interval} ${p.currency} ${p.amount}`,
    );
    expect(prices.sort()).toEqual([
      "month gbp 900",
      "month ngn 1500000",
      "month usd 1000",
      "year gbp 9000",
    ]);
  });

  test("syncing the same config again changes nothing", async () => {
    const { first, sync } = await synced();
    const again = await (await sync(CONFIG)).json();
    expect(again).toMatchObject({ changed: false, created: [], updated: [], archived: [] });
    expect(again.plans).toEqual(first.plans);
  });

  test("a new amount is a new price; the old one stays for existing subscribers", async () => {
    const { call, first, sync } = await synced();
    const oldGbp = first.plans
      .find((p: { key: string }) => p.key === "pro")
      .prices.find(
        (p: { currency: string; interval: string }) =>
          p.currency === "gbp" && p.interval === "month",
      );
    const raised = {
      ...CONFIG,
      plans: {
        ...CONFIG.plans,
        pro: {
          ...CONFIG.plans.pro,
          prices: { ...CONFIG.plans.pro.prices, month: { GBP: 1200, USD: 1000, NGN: 1_500_000 } },
        },
      },
    };
    const result = await (await sync(raised)).json();
    expect(result.created).toEqual(["price pro month GBP 1200"]);
    const pro = await (await call("/v1/plans/pro")).json();
    const gbp = pro.prices.filter(
      (p: { currency: string; interval: string }) => p.currency === "gbp" && p.interval === "month",
    );
    expect(gbp).toMatchObject([
      { id: oldGbp.id, active: false },
      { amount: 1200, active: true },
    ]);
  });

  test("plans and prices left out are archived, not deleted", async () => {
    const { call, sync } = await synced();
    const result = await (
      await sync({
        features: CONFIG.features,
        plans: { pro: { ...CONFIG.plans.pro, prices: { month: { GBP: 900 } } } },
      })
    ).json();
    expect(result.archived).toEqual(
      expect.arrayContaining(["plan free", "price pro month USD 1000", "price pro year GBP 9000"]),
    );
    const active = await (await call("/v1/plans")).json();
    expect(active.data.map((p: { key: string }) => p.key)).toEqual(["pro"]);
    const all = await (await call("/v1/plans?include_inactive=true")).json();
    expect(all.data.find((p: { key: string }) => p.key === "free").active).toBe(false);
  });

  test("bad configs are a 400 pointing at the problem", async () => {
    const { sync } = await synced();
    const cases: Array<[object, string]> = [
      [{ plans: { pro: { name: "Pro", features: { nope: true } } } }, "plans.pro.features.nope"],
      [
        {
          features: { seats: "limit" },
          plans: { pro: { name: "Pro", features: { seats: true } } },
        },
        "plans.pro.features.seats",
      ],
      [
        { plans: { pro: { name: "Pro", prices: { month: { XYZ: 100 } } } } },
        "plans.pro.prices.month.XYZ",
      ],
      [{ plans: { "Pro Plan": { name: "Pro" } } }, "plans.Pro Plan"],
    ];
    for (const [config, param] of cases) {
      const res = await sync(config);
      expect(res.status).toBe(400);
      expect((await res.json()).error.param).toBe(param);
    }
  });

  test("catalogs are per merchant", async () => {
    const { call, otherKey } = await synced();
    expect((await (await call("/v1/plans", { key: otherKey })).json()).data).toEqual([]);
    expect((await call("/v1/plans/pro", { key: otherKey })).status).toBe(404);
  });
});
