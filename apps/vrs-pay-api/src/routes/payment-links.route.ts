import { resourceMissing } from "@vrs-pay/core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppDeps, AppEnv } from "../app.types";
import { platformStripeKey, platformStripePublishableKey } from "../deps/stripe-modes";
import { listLimit } from "../lib/list-limit";
import { readJson } from "../lib/read-json";
import { applyCheckoutTax } from "../services/checkout-tax.service";
import { hostedPageUrl, startHostedCheckout } from "../services/hosted-checkout.service";
import { createPaymentLink, publicLink } from "../services/payment-link.service";
import { openPaymentLink } from "../services/payment-link-open.service";
import {
  CheckoutStartSchema,
  CheckoutTaxSchema,
  CreatePaymentLinkSchema,
  UpdatePaymentLinkSchema,
} from "./payment-link.schema";
import { paymentLinkPage } from "./payment-link-page";

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
    })
    .delete("/:id", async (c) => {
      const { id: merchantId, mode } = c.get("merchant");
      const deleted = await deps.paymentLinks.delete(merchantId, mode, c.req.param("id"));
      if (!deleted) throw resourceMissing("payment link", c.req.param("id"));
      return c.json({ id: c.req.param("id"), object: "payment_link", deleted: true });
    });
}

/**
 * `/l/:id` — public. GET shows a page that posts straight back (so link
 * previews never start a checkout); POST opens a checkout and redirects
 * the payer to it.
 */
export function paymentLinkRedirect(deps: AppDeps): Hono<AppEnv> {
  return (
    new Hono<AppEnv>()
      .get("/:id", async (c) => {
        const stored = await deps.paymentLinks.find(c.req.param("id"));
        if (!stored) throw resourceMissing("payment link", c.req.param("id"));
        return c.html(paymentLinkPage(stored.link));
      })
      .post("/:id", async (c) => c.redirect(await openPaymentLink(deps, c.req.param("id")), 303))
      // The site's checkout page calls these from the buyer's browser.
      .use("/session/*", cors({ origin: deps.urls.site }))
      .post("/session/:id/start", async (c) => {
        const { email } = CheckoutStartSchema.parse(await readJson(c));
        return c.json(await startHostedCheckout(deps, c.req.param("id"), email));
      })
      .post("/session/:id/tax", async (c) => {
        const { address } = CheckoutTaxSchema.parse(await readJson(c));
        return c.json(
          await applyCheckoutTax(deps, c.req.param("id"), {
            country: address.country,
            postalCode: address.postal_code,
            state: address.state,
            city: address.city,
            line1: address.line1,
            line2: address.line2,
          }),
        );
      })
      .get("/session/:id", async (c) => {
        const stored = await deps.checkoutSessions.findById(c.req.param("id"));
        if (!stored) throw resourceMissing("checkout session", c.req.param("id"));
        const { session } = stored;
        let clientSecret = session.client_secret;
        if (!clientSecret && session.provider === "stripe" && session.provider_reference) {
          try {
            const stripeKey = platformStripeKey(process.env, stored.mode);
            if (stripeKey) {
              const { createStripeClient } = await import("../providers/stripe/stripe-client");
              const stripe = createStripeClient(stripeKey);
              if (session.provider_reference.startsWith("pi_")) {
                const pi = await stripe.paymentIntents.retrieve(session.provider_reference);
                clientSecret = pi.client_secret ?? null;
              } else if (session.provider_reference.startsWith("seti_")) {
                const si = await stripe.setupIntents.retrieve(session.provider_reference);
                clientSecret = si.client_secret ?? null;
              }
            }
          } catch {
            // ignore lookup errors
          }
        }
        const profile = await deps.providerAccounts.merchantProfile(stored.merchantId, stored.mode);
        return c.json({
          id: session.id,
          merchant_name: profile?.name ?? null,
          amount: session.amount,
          currency: session.currency,
          description: session.description,
          client_secret: clientSecret,
          status: session.status,
          provider: session.provider,
          // The session's own mode: a test checkout needs the test key.
          publishable_key: platformStripePublishableKey(process.env, stored.mode),
          success_url: session.success_url,
          cancel_url: session.cancel_url,
          // Providers that take payment on their own page (Paystack): where to
          // send the buyer, or that the page must ask for their email first.
          checkout_url:
            session.provider !== "stripe" && session.url !== hostedPageUrl(deps, session.id)
              ? session.url
              : null,
          needs_email:
            session.provider !== "stripe" && session.url === hostedPageUrl(deps, session.id),
          customer_email: session.customer_email,
          // When on, the page asks for an address and adds tax before payment.
          tax_enabled:
            deps.modes[stored.mode].tax === true &&
            Boolean(deps.modes[stored.mode].providers[session.provider].applyTax),
        });
      })
  );
}
