import { DEFAULT_FEE_BPS, newId } from "@vrs-pay/core";
import { Hono } from "hono";
import { z } from "zod";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import type { Membership } from "../stores/merchant.store";

const NewOrganizationSchema = z.strictObject({ name: z.string().trim().min(1).max(100) });

const toOrganization = ({ merchantId, name, role }: Membership) => ({
  id: merchantId,
  object: "organization" as const,
  name,
  role,
});

/** `/dashboard/organizations` — the businesses a user runs; each has its own setup, keys and data. */
export function organizationRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const memberships = await deps.merchants.listForUser(c.get("user").id);
      return c.json({ object: "list", data: memberships.map(toOrganization) });
    })
    .post("/", async (c) => {
      const { name } = NewOrganizationSchema.parse(await readJson(c));
      const user = c.get("user");
      const id = newId("merchant");
      await deps.merchants.createForUser(user, {
        id,
        name,
        email: user.email,
        platformFeeBps: DEFAULT_FEE_BPS,
        created: Math.floor(Date.now() / 1000),
      });
      return c.json(toOrganization({ merchantId: id, name, role: "owner" }));
    });
}
