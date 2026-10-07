import { FIXED_FEE_MINOR, generateApiKey, newId, resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import { z } from "zod";
import type { AppDeps, AppEnv } from "../app.types";
import { idTypesFor } from "../identity/id-types";
import { readJson } from "../lib/read-json";
import { overview } from "../services/analytics.service";
import { merchantBalance } from "../services/balance.service";
import { setupWithIdentity, verifyIdentity } from "../services/identity.service";
import { copyProductToLive } from "../services/product-copy.service";
import { chargeableCurrencies } from "../services/platform";
import { accountSetup } from "../services/setup.service";
import { updateSetup } from "../services/setup-update.service";
import { IdentitySchema, SetupUpdateSchema } from "./setup.schema";

const NewKeySchema = z.strictObject({ kind: z.enum(["secret", "publishable"]).default("secret") });
const MerchantPatchSchema = z.strictObject({ name: z.string().trim().min(1).max(100) });

/** Dashboard-only endpoints, behind a signed-in session. */
export function dashboardRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/me", async (c) => {
      const merchant = c.get("merchant");
      const record = await deps.merchants.get(merchant.id);
      const setup = await accountSetup(deps, merchant);
      return c.json({
        object: "dashboard_session",
        user: c.get("user"),
        merchant: {
          ...record,
          platform_fee_bps: merchant.platformFeeBps,
          fixed_fees: FIXED_FEE_MINOR,
        },
        mode: merchant.mode,
        /** Live mode opens once every setup step is done. */
        live_unlocked: setup.completed === setup.total,
        /** What prices can be in: currencies VRS Pay can charge cards in today. */
        currencies: chargeableCurrencies(deps),
        setup: {
          status: setup.status,
          completed: setup.completed,
          total: setup.total,
          next: setup.next,
        },
      });
    })
    .post("/merchant", async (c) => {
      const { name } = MerchantPatchSchema.parse(await readJson(c));
      await deps.merchants.rename(c.get("merchant").id, name);
      return c.json(await deps.merchants.get(c.get("merchant").id));
    })
    .get("/overview", async (c) => c.json(await overview(deps, c.get("merchant"))))
    .get("/balance", async (c) => c.json(await merchantBalance(deps, c.get("merchant"))))
    .get("/setup", async (c) => c.json(await setupWithIdentity(deps, c.get("merchant"))))
    .post("/setup", async (c) => {
      const input = SetupUpdateSchema.parse(await readJson(c));
      return c.json(await updateSetup(deps, c.get("merchant"), input));
    })
    .post("/setup/identity", async (c) => {
      const input = IdentitySchema.parse(await readJson(c));
      return c.json(await verifyIdentity(deps, c.get("merchant"), input));
    })
    .get("/setup/id-types", (c) => {
      const country = (c.req.query("country") ?? "").toUpperCase();
      const data = idTypesFor(country).map(({ id, label, hint }) => ({ id, label, hint }));
      return c.json({ object: "list", data });
    })
    .post("/products/:id/copy-to-live", async (c) =>
      c.json(await copyProductToLive(deps, c.get("merchant"), c.req.param("id"))),
    )
    .get("/keys", async (c) => {
      const { id, mode } = c.get("merchant");
      return c.json({ object: "list", data: await deps.merchants.listKeys(id, mode) });
    })
    .post("/keys", async (c) => {
      const { kind } = NewKeySchema.parse(await readJson(c));
      const { id: merchantId, mode } = c.get("merchant");
      const key = await generateApiKey(kind, mode);
      const id = newId("apiKey");
      await deps.merchants.addKey(merchantId, {
        id,
        mode,
        kind,
        hash: key.hash,
        displayPrefix: key.displayPrefix,
      });
      const now = Math.floor(Date.now() / 1000);
      // The full key is returned here once and never stored.
      return c.json({
        id,
        object: "api_key",
        kind,
        livemode: mode === "live",
        display_prefix: key.displayPrefix,
        created: now,
        revoked: false,
        secret: key.plaintext,
      });
    })
    .delete("/keys/:id", async (c) => {
      const revoked = await deps.merchants.revokeKey(c.get("merchant").id, c.req.param("id"));
      if (!revoked) throw resourceMissing("api key", c.req.param("id"));
      return c.json({ id: c.req.param("id"), object: "api_key", revoked: true });
    });
}
