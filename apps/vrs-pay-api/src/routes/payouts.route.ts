import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";

/** `/v1/payouts` — money sent to the merchant's bank, read-only. */
export function payoutRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const rows = await deps.payouts.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data: rows.map((r) => r.payout) });
    })
    .get("/:id", async (c) => {
      const { id, mode } = c.get("merchant");
      const record = await deps.payouts.get(id, mode, c.req.param("id"));
      if (!record) throw resourceMissing("payout", c.req.param("id"));
      return c.json(record.payout);
    });
}
