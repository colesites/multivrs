import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { listLimit } from "../lib/list-limit";
import { readJson } from "../lib/read-json";
import {
  createCustomer,
  createCustomerSession,
  findCustomer,
  getCustomer,
  updateCustomer,
} from "../services/customer.service";
import {
  CreateCustomerSchema,
  CreateCustomerSessionSchema,
  UpdateCustomerSchema,
} from "./customer.schema";

/** `/v1/customers` — the merchant's users and organizations. */
export function customerRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreateCustomerSchema.parse(await readJson(c));
      return c.json(await createCustomer(deps, c.get("merchant"), input));
    })
    .get("/", async (c) => {
      const merchant = c.get("merchant");
      const externalId = c.req.query("external_id");
      if (externalId) return c.json(await findCustomer(deps, merchant, externalId));
      const rows = await deps.customers.list(
        merchant.id,
        merchant.mode,
        listLimit(c.req.query("limit")),
      );
      return c.json({ object: "list", data: rows.map((r) => r.customer) });
    })
    .get("/:id", async (c) => c.json(await getCustomer(deps, c.get("merchant"), c.req.param("id"))))
    .post("/:id", async (c) => {
      const patch = UpdateCustomerSchema.parse(await readJson(c));
      return c.json(await updateCustomer(deps, c.get("merchant"), c.req.param("id"), patch));
    })
    .delete("/:id", async (c) => {
      const merchant = c.get("merchant");
      const id = c.req.param("id");
      const removed = await deps.customers.remove(merchant.id, merchant.mode, id);
      if (!removed) throw resourceMissing("customer", id);
      return c.json({ id, object: "customer" as const, deleted: true });
    });
}

/** `/v1/customer_sessions` — short-lived secrets for the browser components. */
export function customerSessionRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>().post("/", async (c) => {
    const input = CreateCustomerSessionSchema.parse(await readJson(c));
    return c.json(await createCustomerSession(deps, c.get("merchant"), input));
  });
}
