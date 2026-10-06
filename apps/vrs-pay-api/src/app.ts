import { VrsPayError } from "@vrs-pay/core";
import { Hono } from "hono";
import type { AppDeps, AppEnv } from "./app.types";
import { errorHandler } from "./lib/error-handler";
import { authenticate } from "./middleware/authenticate";
import { idempotency } from "./middleware/idempotency";
import { requestContext } from "./middleware/request-context";
import { checkoutSessionRoutes } from "./routes/checkout-sessions.route";
import { healthRoutes } from "./routes/health.route";

/**
 * The VRS Pay API. Everything under /v1 needs a secret key; writes honour
 * Idempotency-Key. Dependencies are injected so tests and database-backed
 * stores can be swapped in.
 */
export function createApp(deps: AppDeps): Hono<AppEnv> {
  const v1 = new Hono<AppEnv>()
    .use("*", authenticate(deps.apiKeys))
    .use("*", idempotency(deps.idempotency))
    .route("/checkout/sessions", checkoutSessionRoutes(deps));

  return new Hono<AppEnv>()
    .use("*", requestContext)
    .route("/", healthRoutes())
    .route("/v1", v1)
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
