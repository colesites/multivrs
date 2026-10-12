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
  type ProviderId,
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

/** Providers set up in this mode whose platform account takes this currency. */
function providersTaking(deps: AppDeps, mode: ApiKeyMode, currency: CurrencyCode): ProviderId[] {
  const { platformProviders, currencies } = deps.modes[mode];
  return platformProviders.filter((p) => currencies?.[p]?.includes(currency) ?? true);
}

/** The provider for a payment, among those the platform is set up with in this mode. */
export function routeOnPlatform(
  deps: AppDeps,
  mode: ApiKeyMode,
  currency: Money["currency"],
  method: PaymentMethod,
) {
  if (deps.modes[mode].platformProviders.length === 0) {
    throw invalidRequest(
      "mode_unavailable",
      mode === "live"
        ? "Live payments aren't switched on for VRS Pay yet. Use test mode for now."
        : "Test payments aren't set up on this server.",
    );
  }
  return routePayment({
    currency,
    method,
    enabledProviders: providersTaking(deps, mode, currency),
  });
}

/**
 * Currencies VRS Pay can charge cards in today, across both modes' provider
 * accounts (NGN arrives with a Nigerian Paystack account). Sorted, for the dashboard.
 */
export function chargeableCurrencies(deps: AppDeps): CurrencyCode[] {
  return CURRENCY_CODES.filter((currency) =>
    (["test", "live"] as const).some((mode) =>
      providersTaking(deps, mode, currency).some((p) => providerSupports(p, currency, "card")),
    ),
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
/** Added to our rate when Stripe converts a payment to settle it: about what Stripe charges for that. */
export const CONVERSION_FEE_BPS = 200;

/** Currencies Stripe settles without converting: those the platform account holds. */
export function settlementCurrencies(deps: AppDeps): readonly CurrencyCode[] {
  return deps.settlementCurrencies ?? ["GBP"];
}

/** Stripe converts payments in currencies the platform account doesn't hold; Paystack settles locally. */
export function isConverted(deps: AppDeps, provider: ProviderId, currency: CurrencyCode): boolean {
  return provider === "stripe" && !settlementCurrencies(deps).includes(currency);
}

/** Chargeable currencies whose card payments Stripe would convert in this mode. */
export function convertedCurrencies(deps: AppDeps, mode: ApiKeyMode): CurrencyCode[] {
  return chargeableCurrencies(deps).filter((currency) => {
    const enabledProviders = providersTaking(deps, mode, currency);
    if (enabledProviders.length === 0) return isConverted(deps, "stripe", currency);
    try {
      const { provider } = routePayment({ currency, method: "card", enabledProviders });
      return isConverted(deps, provider, currency);
    } catch {
      return false;
    }
  });
}

/** Our fee on a payment: the merchant's rate (plus the conversion fee when it applies) and the fixed part. */
export function feeFor(
  deps: AppDeps,
  merchant: MerchantProfile,
  amount: Money,
  provider: ProviderId,
): Money {
  const conversion = isConverted(deps, provider, amount.currency) ? CONVERSION_FEE_BPS : 0;
  return platformFee(amount, merchant.platformFeeBps + conversion);
}

/** The provider account a stored payment was charged on: null means the platform's. */
export function accountOf(payment: StoredPayment): string | null {
  return payment.providerAccountId === PLATFORM_ACCOUNT ? null : payment.providerAccountId;
}
