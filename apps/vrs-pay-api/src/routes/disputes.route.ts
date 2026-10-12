import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";

/** `/v1/disputes` — chargebacks on the merchant's payments, read-only. */
export function disputeRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const rows = await deps.disputes.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data: rows.map((r) => r.dispute) });
    })
    .get("/:id", async (c) => {
      const { id, mode } = c.get("merchant");
      const record = await deps.disputes.get(id, mode, c.req.param("id"));
      if (!record) throw resourceMissing("dispute", c.req.param("id"));
      return c.json(record.dispute);
    });
}
