import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { authenticateClient, CUSTOMER_SESSION_HEADER } from "../middleware/authenticate-client";
import {
  customerOverview,
  ownSubscription,
  pricing,
  requireCustomer,
} from "../services/client.service";
import { clientCheckout } from "../services/client-checkout.service";
import { entitlementsFor, grants } from "../services/entitlements.service";
import { cancelSubscription, resumeSubscription, scopeOf } from "../services/subscription.service";
import { changeSubscription } from "../services/subscription-change.service";
import { ClientChangeSchema, ClientCheckoutSchema } from "./client.schema";

/**
 * `/client/v1` — what `@vrs-pay/js` and `@vrs-pay/react` call from
 * browsers, with a publishable key. Pricing is public; everything about a
 * customer needs their session secret, and only reaches their own data.
 */
export function clientRoutes(deps: AppDeps): Hono<AppEnv> {
  const customer = (c: { get(key: "customer"): AppEnv["Variables"]["customer"] }) =>
    requireCustomer(c.get("customer"));
  return new Hono<AppEnv>()
    .use(
      "*",
      cors({
        origin: "*",
        allowHeaders: ["Authorization", "Content-Type", CUSTOMER_SESSION_HEADER],
        allowMethods: ["GET", "POST"],
      }),
    )
    .use("*", authenticateClient(deps.apiKeys, deps.customers))
    .get("/pricing", async (c) => c.json(await pricing(deps, c.get("merchant"))))
    .get("/customer", async (c) =>
      c.json(await customerOverview(deps, c.get("merchant"), customer(c))),
    )
    .get("/entitlements", async (c) => {
      const merchant = c.get("merchant");
      const entitlements = await entitlementsFor(deps, scopeOf(merchant), customer(c).customer.id);
      const feature = c.req.query("feature");
      return c.json(
        feature
          ? { ...entitlements, feature, granted: grants(entitlements, feature) }
          : entitlements,
      );
    })
    .post("/checkout", async (c) => {
      const input = ClientCheckoutSchema.parse(await readJson(c));
      return c.json(await clientCheckout(deps, c.get("merchant"), customer(c), input));
    })
    .post("/subscriptions/:id", async (c) => {
      const { price } = ClientChangeSchema.parse(await readJson(c));
      const merchant = c.get("merchant");
      const sub = await ownSubscription(deps, merchant, customer(c), c.req.param("id"));
      return c.json(await changeSubscription(deps, merchant, sub.subscription.id, { price }));
    })
    .post("/subscriptions/:id/cancel", async (c) => {
      const merchant = c.get("merchant");
      const sub = await ownSubscription(deps, merchant, customer(c), c.req.param("id"));
      // From the browser, cancel at period end: the customer keeps what they paid for.
      return c.json(await cancelSubscription(deps, merchant, sub.subscription.id, "period_end"));
    })
    .post("/subscriptions/:id/resume", async (c) => {
      const merchant = c.get("merchant");
      const sub = await ownSubscription(deps, merchant, customer(c), c.req.param("id"));
      return c.json(await resumeSubscription(deps, merchant, sub.subscription.id));
    });
}
