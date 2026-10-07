import { VrsPayError } from "@vrs-pay/core";
import type { AppDeps, MerchantContext } from "../app.types";
import { accountSetup } from "./setup.service";

/** Test mode always works; live payments need a fully set-up account that isn't on hold. */
export async function assertCanCharge(deps: AppDeps, merchant: MerchantContext): Promise<void> {
  if (merchant.mode !== "live") return;
  const setup = await accountSetup(deps, merchant);
  if (setup.status === "active") return;
  throw new VrsPayError({
    type: "invalid_request_error",
    code: setup.status === "restricted" ? "account_on_hold" : "account_setup_incomplete",
    message:
      setup.status === "restricted"
        ? "This account is on hold. Contact VRS Pay support."
        : "Finish setting up your account in the VRS Pay dashboard before taking live payments.",
    status: 403,
  });
}
