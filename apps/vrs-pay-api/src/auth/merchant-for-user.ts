import { DEFAULT_FEE_BPS, newId } from "@vrs-pay/core";
import type { DashboardUser } from "../app.types";
import type { MerchantStore } from "../stores/merchant.store";

/** The user's merchant, created on first sign-in. */
export async function ensureMerchant(
  merchants: MerchantStore,
  user: Pick<DashboardUser, "id" | "name" | "email">,
): Promise<{ merchantId: string; role: string }> {
  const existing = await merchants.forUser(user.id);
  if (existing) return existing;
  const id = newId("merchant");
  const name = user.name.trim() ? `${user.name.trim()}'s business` : "My business";
  await merchants.createForUser(user, {
    id,
    name,
    email: user.email,
    platformFeeBps: DEFAULT_FEE_BPS,
    created: Math.floor(Date.now() / 1000),
  });
  return { merchantId: id, role: "owner" };
}
