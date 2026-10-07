import type { AccountUpdatedData } from "@vrs-pay/core";

export type ProviderAccountStatus = "pending" | "active" | "restricted";

/** Active once the provider lets the account take charges. */
export function accountStatusFor(update: AccountUpdatedData): ProviderAccountStatus {
  if (update.chargesEnabled) return "active";
  return update.detailsSubmitted ? "restricted" : "pending";
}
