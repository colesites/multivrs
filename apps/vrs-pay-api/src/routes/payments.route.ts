import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";
import { paymentsToCsv } from "../lib/payments-csv";
import { merchantNet } from "../services/payment-net";
import { paymentsAnalytics } from "../services/payments-analytics.service";

/** `/v1/payments` — payments from checkouts, renewals and upgrades. */
export function paymentRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/analytics", async (c) => {
      const merchant = c.get("merchant");
      const range = Number(c.req.query("range") || "30");
      const data = await paymentsAnalytics(deps, merchant, { rangeDays: range });
      return c.json(data);
    })
    .get("/export", async (c) => {
      const { id, mode } = c.get("merchant");
      const limit = Math.min(Math.max(1, Number(c.req.query("limit") || 1000)), 5000);
      const status = c.req.query("status") as any;
      const search = c.req.query("search") || c.req.query("q") || undefined;
      const customer = c.req.query("customer") || undefined;
      const rows = await deps.payments.list(id, mode, { limit, status, search, customer });
      const csv = paymentsToCsv(rows.map((r) => r.payment));
      const filename = `payments_${mode}_${new Date().toISOString().slice(0, 10)}.csv`;
      c.header("Content-Type", "text/csv; charset=utf-8");
      c.header("Content-Disposition", `attachment; filename="${filename}"`);
      return c.body(csv);
    })
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const format = c.req.query("format");
      const status = c.req.query("status") as any;
      const search = c.req.query("search") || c.req.query("q") || undefined;
      const customer = c.req.query("customer") || undefined;
      if (format === "csv") {
        const limit = Math.min(Math.max(1, Number(c.req.query("limit") || 1000)), 5000);
        const rows = await deps.payments.list(id, mode, { limit, status, search, customer });
        const csv = paymentsToCsv(rows.map((r) => r.payment));
        const filename = `payments_${mode}_${new Date().toISOString().slice(0, 10)}.csv`;
        c.header("Content-Type", "text/csv; charset=utf-8");
        c.header("Content-Disposition", `attachment; filename="${filename}"`);
        return c.body(csv);
      }
      const limit = listLimit(c.req.query("limit"));
      const rows = await deps.payments.list(id, mode, { limit, status, search, customer });
      return c.json({ object: "list", data: rows.map((r) => r.payment) });
    })
    .get("/:id", async (c) => {
      const { id: merchantId, mode } = c.get("merchant");
      const id = c.req.param("id");
      const stored = await deps.payments.get(merchantId, mode, id);
      if (!stored) throw resourceMissing("payment", id);
      const allRefunds = await deps.refunds.list(merchantId, mode, 100);
      const paymentRefunds = allRefunds.filter((r) => r.refund.payment === id).map((r) => r.refund);
      const net = merchantNet(stored.payment);
      return c.json({
        ...stored.payment,
        net,
        refunds: paymentRefunds,
      });
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
