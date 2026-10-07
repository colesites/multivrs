/**
 * vrs-pay-api — the "finish setting up" checklist: six steps, ID checks by
 * country, encrypted details, automatic activation, staff holds, live gate.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError } from "@vrs-pay/core";
import { SANDBOX_FAILING_NUMBER } from "../../apps/vrs-pay-api/src/identity/verifiers";
import { assertCanCharge } from "../../apps/vrs-pay-api/src/services/live-gate";
import { dashboardHarness } from "./dashboard-harness";

const NIGERIAN_ID = {
  country: "NG",
  id_type: "bvn",
  id_number: "2234 5678 901",
  first_name: "Ada",
  last_name: "Okafor",
  date_of_birth: "1990-04-12",
};
const DETAILS = {
  product_description: "Developer tools sold as monthly subscriptions",
  website: "https://ada.dev",
  support_email: "help@ada.dev",
  payout: {
    currency: "NGN",
    account_name: "Ada Okafor",
    bank_name: "GTBank",
    account_number: "9988 77 5678",
    bank_code: "058",
  },
};

async function setUp() {
  const h = await dashboardHarness();
  const steps = async () =>
    (await (await h.dash("/setup")).json()) as {
      status: string;
      steps: Array<{ id: string; done: boolean }>;
      next: string | null;
    };
  return { ...h, steps };
}

describe("/dashboard/setup", () => {
  test("six steps, none done; the first is creating a product", async () => {
    const { steps } = await setUp();
    const view = await steps();
    expect(view).toMatchObject({ status: "setup", next: "product" });
    expect(view.steps.map((s) => s.id)).toEqual([
      "product",
      "identity",
      "payout",
      "description",
      "website",
      "support_email",
    ]);
  });

  test("ID types follow the business location", async () => {
    const { dash } = await setUp();
    const ng = (await (await dash("/setup/id-types?country=NG")).json()).data.map(
      (t: { id: string }) => t.id,
    );
    expect(ng).toEqual(["bvn", "nin"]);
    const fr = (await (await dash("/setup/id-types?country=FR")).json()).data.map(
      (t: { id: string }) => t.id,
    );
    expect(fr).toEqual(["passport", "national_id"]);
  });

  test("a BVN is checked, stored encrypted, and only its last 4 digits come back", async () => {
    const { dash, deps, sealer } = await setUp();
    const view = await (await dash("/setup/identity", { body: NIGERIAN_ID })).json();
    expect(view.details.identity).toMatchObject({
      country: "NG",
      id_type: "bvn",
      last4: "8901",
      status: "verified",
    });
    expect(view.steps.find((s: { id: string }) => s.id === "identity").done).toBe(true);
    expect(JSON.stringify(view)).not.toContain("22345678901");
    const merchantId = (await (await dash("/me")).json()).merchant.id;
    const stored = await deps.onboarding.get(merchantId);
    expect(await sealer.open(stored?.idNumber ?? "")).toBe("22345678901");
  });

  test("wrong ID types, bad numbers and failed checks are explained", async () => {
    const { dash } = await setUp();
    const wrongType = await dash("/setup/identity", {
      body: { ...NIGERIAN_ID, id_type: "ghana_card" },
    });
    expect([wrongType.status, (await wrongType.json()).error.param]).toEqual([400, "id_type"]);
    const short = await dash("/setup/identity", { body: { ...NIGERIAN_ID, id_number: "123" } });
    expect((await short.json()).error.message).toContain("11 digits");
    const failed = await (
      await dash("/setup/identity", { body: { ...NIGERIAN_ID, id_number: SANDBOX_FAILING_NUMBER } })
    ).json();
    expect(failed.details.identity).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("don't match"),
    });
  });

  test("only a product with a price counts as the first product, not a payment link", async () => {
    const { dash, steps } = await setUp();
    await dash("/v1/payment_links", {
      body: { amount: 4900, currency: "gbp", description: "Consultation" },
    });
    expect((await steps()).next).toBe("product");
    await dash("/v1/products", {
      body: { name: "E-book", prices: [{ amount: 1500, currency: "usd" }] },
    });
    expect((await steps()).next).toBe("identity");
  });

  test("finishing every step makes the account active — no review to submit", async () => {
    const { dash, steps } = await setUp();
    await dash("/v1/products", {
      body: { name: "Pro", prices: [{ amount: 4900, currency: "gbp", interval: "month" }] },
    });
    await dash("/setup/identity", { body: NIGERIAN_ID });
    const saved = await (await dash("/setup", { body: DETAILS })).json();
    expect(saved.details.payout).toEqual({
      currency: "NGN",
      account_name: "Ada Okafor",
      bank_name: "GTBank",
      last4: "5678",
    });
    expect(await steps()).toMatchObject({ status: "active", next: null });
    expect((await (await dash("/me")).json()).setup).toMatchObject({
      status: "active",
      completed: 6,
    });
  });

  test("staff holds override everything; live payments need an active account", async () => {
    const { dash, deps, steps } = await setUp();
    const me = await (await dash("/me")).json();
    const merchant = {
      id: me.merchant.id,
      name: "X",
      enabledProviders: [],
      providerAccounts: {},
      platformFeeBps: 500,
    };
    await assertCanCharge(deps, { ...merchant, mode: "test" });
    const incomplete = await assertCanCharge(deps, { ...merchant, mode: "live" }).catch((e) => e);
    expect(isVrsPayError(incomplete) && incomplete.code).toBe("account_setup_incomplete");

    await dash("/setup", { body: { website: "https://x.dev" } });
    const record = await deps.onboarding.get(me.merchant.id);
    if (!record) throw new Error("setup wasn't saved");
    await deps.onboarding.save({ ...record, status: "rejected", rejectionReason: "Under review" });
    expect(await steps()).toMatchObject({ status: "restricted" });
    const held = await assertCanCharge(deps, { ...merchant, mode: "live" }).catch((e) => e);
    expect(isVrsPayError(held) && held.code).toBe("account_on_hold");
  });
});
