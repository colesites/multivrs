import { IDEMPOTENCY_KEY_HEADER } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { createCheckoutSession, getCheckoutSession } from "../services/checkout-session.service";
import { CreateCheckoutSessionSchema } from "./checkout-session.schema";

/** `/v1/checkout/sessions` — hosted payment pages, routed per payment. */
export function checkoutSessionRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreateCheckoutSessionSchema.parse(await readJson(c));
      const session = await createCheckoutSession(
        deps,
        c.get("merchant"),
        input,
        c.req.header(IDEMPOTENCY_KEY_HEADER),
      );
      return c.json(session);
    })
    .get("/:id", async (c) =>
      c.json(await getCheckoutSession(deps, c.get("merchant"), c.req.param("id"))),
    );
}
