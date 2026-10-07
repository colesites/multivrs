import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";
import { readJson } from "../lib/read-json";
import { createPaymentLink, publicLink } from "../services/payment-link.service";
import { openPaymentLink } from "../services/payment-link-open.service";
import { CreatePaymentLinkSchema, UpdatePaymentLinkSchema } from "./payment-link.schema";

/** `/v1/payment_links` — no-code links to a hosted checkout. */
export function paymentLinkRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreatePaymentLinkSchema.parse(await readJson(c));
      return c.json(await createPaymentLink(deps, c.get("merchant"), input));
    })
    .get("/", async (c) => {
      const { id, mode } = c.get("merchant");
      const rows = await deps.paymentLinks.list(id, mode, listLimit(c.req.query("limit")));
      return c.json({ object: "list", data: rows.map((r) => publicLink(deps, r)) });
    })
    .post("/:id", async (c) => {
      const { active } = UpdatePaymentLinkSchema.parse(await readJson(c));
      const { id: merchantId, mode } = c.get("merchant");
      const updated = await deps.paymentLinks.setActive(
        merchantId,
        mode,
        c.req.param("id"),
        active,
      );
      if (!updated) throw resourceMissing("payment link", c.req.param("id"));
      return c.json(publicLink(deps, updated));
    });
}

/** `GET /l/:id` — public: opens a checkout and redirects the payer to it. */
export function paymentLinkRedirect(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>().get("/:id", async (c) =>
    c.redirect(await openPaymentLink(deps, c.req.param("id")), 303),
  );
}
