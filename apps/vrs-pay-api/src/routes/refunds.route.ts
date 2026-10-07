import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";
import { readJson } from "../lib/read-json";
import { createRefund, getRefund } from "../services/refund.service";
import { CreateRefundSchema } from "./refund.schema";

/** `/v1/refunds` — full or partial refunds of a payment. */
export function refundRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreateRefundSchema.parse(await readJson(c));
      return c.json(await createRefund(deps, c.get("merchant"), input));
    })
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const rows = await deps.refunds.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data: rows.map((r) => r.refund) });
    })
    .get("/:id", async (c) => c.json(await getRefund(deps, c.get("merchant"), c.req.param("id"))));
}
