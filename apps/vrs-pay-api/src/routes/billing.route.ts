import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { getPlan, listFeatures, listPlans, syncCatalog } from "../services/catalog.service";
import { BillingConfigSchema } from "./billing-config.schema";

/** `/v1/billing/sync`, `/v1/plans`, `/v1/features` — the catalog. */
export function billingRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/billing/sync", async (c) => {
      const config = BillingConfigSchema.parse(await readJson(c));
      return c.json(await syncCatalog(deps, c.get("merchant"), config));
    })
    .get("/plans", async (c) => {
      const includeInactive = c.req.query("include_inactive") === "true";
      const data = await listPlans(deps, c.get("merchant"), includeInactive);
      return c.json({ object: "list", data });
    })
    .get("/plans/:id", async (c) =>
      c.json(await getPlan(deps, c.get("merchant"), c.req.param("id"))),
    )
    .get("/features", async (c) =>
      c.json({ object: "list", data: await listFeatures(deps, c.get("merchant")) }),
    );
}
