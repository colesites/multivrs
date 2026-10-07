import { VrsPayError } from "@vrs-pay/core";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppDeps, AppEnv, DashboardAuth } from "./app.types";
import { errorHandler } from "./lib/error-handler";
import { authenticate } from "./middleware/authenticate";
import { dashboardSession, MERCHANT_HEADER, MODE_HEADER } from "./middleware/dashboard-session";
import { idempotency } from "./middleware/idempotency";
import { requestContext } from "./middleware/request-context";
import { dashboardRoutes } from "./routes/dashboard.route";
import { healthRoutes } from "./routes/health.route";
import { organizationRoutes } from "./routes/organizations.route";
import { paymentLinkRedirect } from "./routes/payment-links.route";
import { providerWebhookRoutes } from "./routes/provider-webhooks.route";
import { v1Resources } from "./routes/v1";

const ALLOWED_HEADERS = ["Content-Type", "Idempotency-Key", MERCHANT_HEADER, MODE_HEADER];

/** /auth (sign-in) and /dashboard (the dashboard's API), cookie-authenticated from one origin. */
function withDashboard(app: Hono<AppEnv>, deps: AppDeps, auth: DashboardAuth): Hono<AppEnv> {
  const allowDashboard = cors({
    origin: auth.origin,
    credentials: true,
    allowHeaders: ALLOWED_HEADERS,
  });
  const dashboard = new Hono<AppEnv>()
    .use("*", dashboardSession(deps, auth))
    .use("*", idempotency(deps.idempotency))
    .route("/organizations", organizationRoutes(deps))
    .route("/", dashboardRoutes(deps))
    .route("/v1", v1Resources(deps));
  return (
    app
      .use("/auth/*", allowDashboard)
      // Which sign-in buttons to show; registered before Better Auth's catch-all.
      .get("/auth/providers", (c) => c.json({ email: true, social: auth.socialProviders }))
      .on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
      .use("/dashboard/*", allowDashboard)
      .route("/dashboard", dashboard)
  );
}

/**
 * The VRS Pay API. Everything under /v1 needs a secret key; writes honour
 * Idempotency-Key. /webhooks takes signed provider events; /auth and
 * /dashboard serve the dashboard when sign-in is configured.
 */
export function createApp(deps: AppDeps): Hono<AppEnv> {
  const v1 = new Hono<AppEnv>()
    .use("*", authenticate(deps.apiKeys))
    .use("*", idempotency(deps.idempotency))
    .route("/", v1Resources(deps));

  const app = new Hono<AppEnv>()
    .use("*", requestContext)
    .route("/", healthRoutes())
    .route("/webhooks", providerWebhookRoutes(deps))
    .route("/l", paymentLinkRedirect(deps))
    .route("/v1", v1);
  return (deps.auth ? withDashboard(app, deps, deps.auth) : app)
    .notFound((c) =>
      errorHandler(
        new VrsPayError({
          type: "invalid_request_error",
          code: "route_not_found",
          message: `Unrecognized request URL (${c.req.method} ${c.req.path}).`,
          status: 404,
        }),
        c,
      ),
    )
    .onError(errorHandler);
}
