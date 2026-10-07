import { type ApiKeyMode, authenticationError } from "@vrs-pay/core";
import type { MiddlewareHandler } from "hono";
import type { AppDeps, AppEnv, DashboardAuth, DashboardUser } from "../app.types";
import { ensureMerchant } from "../auth/merchant-for-user";

/** Which of the user's businesses the dashboard is showing. */
export const MERCHANT_HEADER = "VRS-Merchant";
/** `test` (the default) or `live`. */
export const MODE_HEADER = "VRS-Mode";

/** The business asked for if the user belongs to it, otherwise their first (made on sign-up). */
async function pickMerchant(deps: AppDeps, user: DashboardUser, requested: string | undefined) {
  if (requested) {
    const memberships = await deps.merchants.listForUser(user.id);
    if (memberships.some((m) => m.merchantId === requested)) return requested;
  }
  return (await ensureMerchant(deps.merchants, user)).merchantId;
}

/**
 * Resolves the signed-in dashboard user to one of their businesses, in the
 * mode they're viewing, so every /v1 handler works unchanged behind
 * /dashboard/v1. Live payments stay gated on a finished setup (live-gate).
 */
export function dashboardSession(deps: AppDeps, auth: DashboardAuth): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = await auth.session(c.req.raw.headers);
    if (!user) throw authenticationError("Sign in to use the dashboard.");
    const merchantId = await pickMerchant(deps, user, c.req.header(MERCHANT_HEADER));
    const mode: ApiKeyMode = c.req.header(MODE_HEADER) === "live" ? "live" : "test";
    const profile = await deps.providerAccounts.merchantProfile(merchantId, mode);
    if (!profile) throw authenticationError("Your account has no merchant yet.");
    c.set("user", user);
    c.set("merchant", { ...profile, mode });
    await next();
  };
}
