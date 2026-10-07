import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { billingRoutes } from "./billing.route";
import { checkoutSessionRoutes } from "./checkout-sessions.route";
import { customerRoutes, customerSessionRoutes } from "./customers.route";
import { paymentLinkRoutes } from "./payment-links.route";
import { eventRoutes, paymentRoutes } from "./payments.route";
import { priceRoutes, productRoutes } from "./products.route";
import { refundRoutes } from "./refunds.route";
import { entitlementRoutes, invoiceRoutes, subscriptionRoutes } from "./subscriptions.route";
import { webhookEndpointRoutes } from "./webhook-endpoints.route";

/**
 * Every /v1 resource, for whoever set `merchant` on the context: an API key
 * (`/v1`) or a dashboard session (`/dashboard/v1`).
 */
export function v1Resources(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .route("/checkout/sessions", checkoutSessionRoutes(deps))
    .route("/payments", paymentRoutes(deps))
    .route("/events", eventRoutes(deps))
    .route("/refunds", refundRoutes(deps))
    .route("/webhook_endpoints", webhookEndpointRoutes(deps))
    .route("/customers", customerRoutes(deps))
    .route("/customer_sessions", customerSessionRoutes(deps))
    .route("/subscriptions", subscriptionRoutes(deps))
    .route("/invoices", invoiceRoutes(deps))
    .route("/entitlements", entitlementRoutes(deps))
    .route("/payment_links", paymentLinkRoutes(deps))
    .route("/products", productRoutes(deps))
    .route("/prices", priceRoutes(deps))
    .route("/", billingRoutes(deps));
}
