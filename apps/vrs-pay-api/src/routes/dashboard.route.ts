import { FIXED_FEE_MINOR, resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import { z } from "zod";
import type { AppDeps, AppEnv } from "../app.types";
import { idTypesFor } from "../identity/id-types";
import { readJson } from "../lib/read-json";
import { overview } from "../services/analytics.service";
import {
  createApiKey,
  ensureDefaultKeys,
  revealApiKey,
  rollApiKey,
} from "../services/api-keys.service";
import { merchantBalance } from "../services/balance.service";
import { setupWithIdentity, verifyIdentity } from "../services/identity.service";
import { nairaRail, payOutNow, payoutSchedule } from "../services/payout.service";
import {
  CONVERSION_FEE_BPS,
  chargeableCurrencies,
  convertedCurrencies,
} from "../services/platform";
import { copyProductToLive } from "../services/product-copy.service";
import { accountSetup } from "../services/setup.service";
import { resolveNairaAccount, updateSetup } from "../services/setup-update.service";
import { IdentitySchema, SetupUpdateSchema } from "./setup.schema";

const NewKeySchema = z.strictObject({
  kind: z.enum(["secret", "publishable"]).default("secret"),
  name: z.string().trim().max(60).optional(),
});
const ResolveAccountSchema = z.strictObject({
  account_number: z.string().regex(/^\d{10}$/, "Nigerian account numbers have 10 digits"),
  bank_code: z.string().trim().min(1).max(20),
});
const MerchantPatchSchema = z.strictObject({ name: z.string().trim().min(1).max(100) });

/** Dashboard-only endpoints, behind a signed-in session. */
export function dashboardRoutes(deps: AppDeps): Hono<AppEnv> {
  return (
    new Hono<AppEnv>()
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
            /** Added to the rate on card payments Stripe converts to settle. */
            conversion_fee_bps: CONVERSION_FEE_BPS,
            /** Currencies whose card payments get the conversion fee in this mode. */
            converted_currencies: convertedCurrencies(deps, merchant.mode),
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
      .get("/balance", async (c) => {
        const merchant = c.get("merchant");
        return c.json({
          ...(await merchantBalance(deps, merchant)),
          payouts: await payoutSchedule(deps, merchant),
        });
      })
      /** Today's payout, now rather than at the daily run. */
      .post("/payouts", async (c) => c.json(await payOutNow(deps, c.get("merchant"))))
      /** Banks a naira payout account can be at (Paystack's list). */
      .get("/payouts/banks", async (c) => {
        const banks = await nairaRail(deps, c.get("merchant").mode).banks();
        return c.json({ object: "list", data: banks });
      })
      /** The holder's name for a Nigerian account number, before it's saved. */
      .post("/payouts/resolve", async (c) => {
        const { account_number, bank_code } = ResolveAccountSchema.parse(await readJson(c));
        const rail = nairaRail(deps, c.get("merchant").mode);
        return c.json({ account_name: await resolveNairaAccount(rail, account_number, bank_code) });
      })
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
        // New test accounts get a publishable and a secret key on first look.
        await ensureDefaultKeys(deps, id, mode);
        return c.json({ object: "list", data: await deps.merchants.listKeys(id, mode) });
      })
      .post("/keys", async (c) => {
        const { kind, name } = NewKeySchema.parse(await readJson(c));
        const { id: merchantId, mode } = c.get("merchant");
        return c.json(await createApiKey(deps, merchantId, mode, kind, name || null));
      })
      .post("/keys/:id/reveal", async (c) =>
        c.json(await revealApiKey(deps, c.get("merchant").id, c.req.param("id"))),
      )
      .post("/keys/:id/roll", async (c) =>
        c.json(await rollApiKey(deps, c.get("merchant").id, c.req.param("id"))),
      )
      .delete("/keys/:id", async (c) => {
        const revoked = await deps.merchants.revokeKey(c.get("merchant").id, c.req.param("id"));
        if (!revoked) throw resourceMissing("api key", c.req.param("id"));
        return c.json({ id: c.req.param("id"), object: "api_key", revoked: true });
      })
  );
}
