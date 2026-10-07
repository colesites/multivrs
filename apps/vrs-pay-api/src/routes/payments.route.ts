import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";

/** `/v1/payments` — payments from checkouts, renewals and upgrades. */
export function paymentRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const rows = await deps.payments.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data: rows.map((r) => r.payment) });
    })
    .get("/:id", async (c) => {
      const { id: merchantId, mode } = c.get("merchant");
      const id = c.req.param("id");
      const stored = await deps.payments.get(merchantId, mode, id);
      if (!stored) throw resourceMissing("payment", id);
      return c.json(stored.payment);
    });
}

/** `/v1/events` — everything sent (or queued) to the merchant's webhooks. */
export function eventRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const data = await deps.events.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data });
    })
    .get("/:id", async (c) => {
      const { id: merchantId, mode } = c.get("merchant");
      const event = await deps.events.get(merchantId, mode, c.req.param("id"));
      if (!event) throw resourceMissing("event", c.req.param("id"));
      return c.json(event);
    });
}
