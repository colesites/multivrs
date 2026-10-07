import {
  type ApiKeyMode,
  CURRENCY_CODES,
  type CurrencyCode,
  formatMoney,
  invalidRequest,
  type Money,
  minimumCharge,
  money,
  type PaymentMethod,
  type ProviderRegistry,
  platformFee,
  providerSupports,
  routePayment,
} from "@vrs-pay/core";
import type { AppDeps, MerchantProfile } from "../app.types";
import type { StoredPayment } from "./payment.types";

/** `providerAccountId` for payments charged on the platform's own provider account. */
export const PLATFORM_ACCOUNT = "platform";

/** The provider adapters for a mode: test credentials for test, live for live. */
export function providersFor(deps: AppDeps, mode: ApiKeyMode): ProviderRegistry {
  return deps.modes[mode].providers;
}

/** The provider for a payment, among those the platform is set up with in this mode. */
export function routeOnPlatform(
  deps: AppDeps,
  mode: ApiKeyMode,
  currency: Money["currency"],
  method: PaymentMethod,
) {
  const enabledProviders = deps.modes[mode].platformProviders;
  if (enabledProviders.length === 0) {
    throw invalidRequest(
      "mode_unavailable",
      mode === "live"
        ? "Live payments aren't switched on for VRS Pay yet. Use test mode for now."
        : "Test payments aren't set up on this server.",
    );
  }
  return routePayment({ currency, method, enabledProviders });
}

/**
 * Currencies VRS Pay can charge cards in today, across both modes' providers
 * (NGN, GHS, KES and ZAR arrive with Paystack). Sorted, for the dashboard.
 */
export function chargeableCurrencies(deps: AppDeps): CurrencyCode[] {
  const providers = new Set([
    ...deps.modes.test.platformProviders,
    ...deps.modes.live.platformProviders,
  ]);
  return CURRENCY_CODES.filter((currency) =>
    [...providers].some((p) => providerSupports(p, currency, "card")),
  );
}

/** Prices are only useful if someone can pay them. */
export function assertChargeable(deps: AppDeps, currency: CurrencyCode): void {
  if (chargeableCurrencies(deps).includes(currency)) return;
  throw invalidRequest(
    "currency_unsupported",
    `VRS Pay can't take payments in ${currency} yet. Try ${chargeableCurrencies(deps).join(", ")}.`,
    "currency",
  );
}

/** A charge has to cover the fees: at least the currency's minimum charge (about US$1). */
export function assertMinimumAmount(amount: Money, param = "amount"): void {
  const min = minimumCharge(amount.currency);
  if (amount.amount >= min) return;
  throw invalidRequest(
    "amount_too_small",
    `The smallest amount VRS Pay can charge is ${formatMoney(money(min, amount.currency))}, so the fees are covered.`,
    param,
  );
}

/** VRS Pay's fee for this merchant on `amount`. */
export function feeFor(merchant: MerchantProfile, amount: Money): Money {
  return platformFee(amount, merchant.platformFeeBps);
}

/** The provider account a stored payment was charged on: null means the platform's. */
export function accountOf(payment: StoredPayment): string | null {
  return payment.providerAccountId === PLATFORM_ACCOUNT ? null : payment.providerAccountId;
}
