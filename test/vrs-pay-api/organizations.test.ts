/**
 * vrs-pay-api — one person, several businesses, each with test and live
 * mode: switching is a header, membership is checked, data never mixes.
 */
import { describe, expect, test } from "bun:test";
import { dashboardHarness } from "./dashboard-harness";

const PRODUCT = { name: "E-book", prices: [{ amount: 1500, currency: "usd" }] };
const OK = "https://ada.dev/ok";
const IDENTITY = {
  country: "NG",
  id_type: "nin",
  id_number: "12345678901",
  first_name: "Ada",
  last_name: "Okafor",
  date_of_birth: "1990-04-12",
};
const DETAILS = {
  business: {
    type: "individual",
    address: { line1: "12 Admiralty Way", city: "Lagos" },
    phone: "+234 803 123 4567",
  },
  product_description: "Design e-books",
  website: "https://ada.dev",
  support_email: "help@ada.dev",
  payout: {
    currency: "NGN",
    account_name: "Ada",
    bank_name: "GTBank",
    account_number: "0123456789",
  },
};

describe("organizations", () => {
  test("sign-up gives one business; more can be created and each keeps its own data", async () => {
    const { dash } = await dashboardHarness();
    const first = (await (await dash("/me")).json()).merchant;
    const created = await (await dash("/organizations", { body: { name: "Ada Studio" } })).json();
    expect(created).toMatchObject({ object: "organization", name: "Ada Studio", role: "owner" });
    const orgs = (await (await dash("/organizations")).json()).data;
    expect(orgs.map((o: { id: string }) => o.id)).toEqual([first.id, created.id]);

    await dash("/v1/products", { body: PRODUCT, merchant: created.id });
    const inStudio = (await (await dash("/v1/products", { merchant: created.id })).json()).data;
    const inFirst = (await (await dash("/v1/products", { merchant: first.id })).json()).data;
    expect([inStudio.length, inFirst.length]).toEqual([1, 0]);
    expect((await (await dash("/me", { merchant: created.id })).json()).merchant.name).toBe(
      "Ada Studio",
    );
  });

  test("a business you don't belong to falls back to your own", async () => {
    const { dash } = await dashboardHarness();
    const own = (await (await dash("/me")).json()).merchant.id;
    const me = await (await dash("/me", { merchant: "mer_test_acme" })).json();
    expect(me.merchant.id).toBe(own);
  });
});

describe("test and live mode", () => {
  test("live mode has its own data and unlocks with a finished setup", async () => {
    const { dash } = await dashboardHarness();
    const me = await (await dash("/me", { mode: "live" })).json();
    expect(me).toMatchObject({ mode: "live", live_unlocked: false });
    await dash("/v1/products", { body: PRODUCT, mode: "live" });
    expect((await (await dash("/v1/products", { mode: "live" })).json()).data).toHaveLength(1);
    expect((await (await dash("/v1/products")).json()).data).toHaveLength(0);
  });

  test("live opens after setup, and live payments need live credentials on the server", async () => {
    const { dash } = await dashboardHarness({ liveProviders: false });
    const checkout = () =>
      dash("/v1/checkout/sessions", {
        mode: "live",
        body: { amount: 1000, currency: "usd", success_url: OK, cancel_url: OK },
      });
    expect((await (await checkout()).json()).error.code).toBe("account_setup_incomplete");
    await dash("/v1/products", { body: PRODUCT });
    await dash("/setup/identity", { body: IDENTITY });
    await dash("/setup", { body: DETAILS });
    expect((await (await dash("/me")).json()).live_unlocked).toBe(true);
    expect((await (await checkout()).json()).error.code).toBe("mode_unavailable");
  });
});
