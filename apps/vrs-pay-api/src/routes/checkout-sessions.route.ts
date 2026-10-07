import { IDEMPOTENCY_KEY_HEADER } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { createCheckoutSession, getCheckoutSession } from "../services/checkout-session.service";
import { createSubscriptionCheckout } from "../services/subscription-checkout.service";
import { CreateCheckoutSessionSchema } from "./checkout-session.schema";
import { SubscriptionCheckoutSchema } from "./subscription-checkout.schema";

function isSubscriptionMode(body: unknown): boolean {
  return (
    typeof body === "object" && body !== null && "mode" in body && body.mode === "subscription"
  );
}

/** `/v1/checkout/sessions` — hosted payment pages, routed per payment. */
export function checkoutSessionRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const body = await readJson(c);
      const key = c.req.header(IDEMPOTENCY_KEY_HEADER);
      const merchant = c.get("merchant");
      if (isSubscriptionMode(body)) {
        const input = SubscriptionCheckoutSchema.parse(body);
        return c.json(await createSubscriptionCheckout(deps, merchant, input, key));
      }
      const input = CreateCheckoutSessionSchema.parse(body);
      return c.json(await createCheckoutSession(deps, merchant, input, key));
    })
    .get("/:id", async (c) =>
      c.json(await getCheckoutSession(deps, c.get("merchant"), c.req.param("id"))),
    );
}
