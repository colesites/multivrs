import { invalidRequest, resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { entitlementsFor, grants } from "../services/entitlements.service";
import {
  cancelSubscription,
  listSubscriptions,
  loadSubscription,
  resumeSubscription,
  scopeOf,
} from "../services/subscription.service";
import { changeSubscription } from "../services/subscription-change.service";
import { reportUsage, usageSummary } from "../services/usage.service";
import {
  CancelSubscriptionSchema,
  UpdateSubscriptionSchema,
  UsageRecordSchema,
} from "./subscription.schema";

/** `/v1/subscriptions` — list, read, change, cancel, resume, and report usage. */
export function subscriptionRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const data = await listSubscriptions(deps, c.get("merchant"), c.req.query("customer"));
      return c.json({ object: "list", data });
    })
    .get("/:id", async (c) =>
      c.json((await loadSubscription(deps, c.get("merchant"), c.req.param("id"))).subscription),
    )
    .post("/:id", async (c) => {
      const input = UpdateSubscriptionSchema.parse(await readJson(c));
      return c.json(await changeSubscription(deps, c.get("merchant"), c.req.param("id"), input));
    })
    .post("/:id/usage_records", async (c) => {
      const input = UsageRecordSchema.parse(await readJson(c));
      return c.json(await reportUsage(deps, c.get("merchant"), c.req.param("id"), input));
    })
    .get("/:id/usage", async (c) =>
      c.json(await usageSummary(deps, c.get("merchant"), c.req.param("id"))),
    )
    .post("/:id/cancel", async (c) => {
      const { at } = CancelSubscriptionSchema.parse(await readJson(c));
      return c.json(await cancelSubscription(deps, c.get("merchant"), c.req.param("id"), at));
    })
    .post("/:id/resume", async (c) =>
      c.json(await resumeSubscription(deps, c.get("merchant"), c.req.param("id"))),
    );
}

/** `/v1/invoices` — what each period (or upgrade) cost and whether it's paid. */
export function invoiceRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const filter = {
        customerId: c.req.query("customer"),
        subscriptionId: c.req.query("subscription"),
      };
      const data = await deps.billing.listInvoices(scopeOf(c.get("merchant")), filter);
      return c.json({ object: "list", data: data.map((i) => i.invoice) });
    })
    .get("/:id", async (c) => {
      const stored = await deps.billing.getInvoice(scopeOf(c.get("merchant")), c.req.param("id"));
      if (!stored) throw resourceMissing("invoice", c.req.param("id"));
      return c.json(stored.invoice);
    });
}

/** `/v1/entitlements?customer=…` or `?external_id=…`, optionally `&feature=…`. */
export function entitlementRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>().get("/", async (c) => {
    const merchant = c.get("merchant");
    const externalId = c.req.query("external_id");
    const byExternal = externalId
      ? await deps.customers.findByExternalId(merchant.id, merchant.mode, externalId)
      : null;
    const customerId = c.req.query("customer") ?? byExternal?.customer.id;
    if (!customerId) {
      if (externalId) throw resourceMissing("customer", externalId);
      throw invalidRequest("parameter_missing", "Pass ?customer= or ?external_id=.", "customer");
    }
    const entitlements = await entitlementsFor(deps, scopeOf(merchant), customerId);
    const feature = c.req.query("feature");
    return c.json(
      feature ? { ...entitlements, feature, granted: grants(entitlements, feature) } : entitlements,
    );
  });
}
