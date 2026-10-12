/**
 * vrs-pay-api — payouts: once a day, a merchant's cleared balance goes to
 * their bank (Paystack Transfers for naira) less the transfer fee; failures
 * and bank reversals put the money back; other currencies wait for Stripe.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError, money, platformFee } from "@vrs-pay/core";
import { createSealer } from "../../apps/vrs-pay-api/src/lib/sealer";
import {
  createPaystackPayouts,
  paystackTransferFee,
} from "../../apps/vrs-pay-api/src/providers/paystack/paystack-payouts";
import { merchantBalance } from "../../apps/vrs-pay-api/src/services/balance.service";
import { emptyOnboarding } from "../../apps/vrs-pay-api/src/services/onboarding.types";
import {
  payOutNow,
  payoutAmounts,
  payoutSchedule,
  runPayouts,
} from "../../apps/vrs-pay-api/src/services/payout.service";
import { updateSetup } from "../../apps/vrs-pay-api/src/services/setup-update.service";
import { harness, MERCHANT } from "./harness";
import {
  chargeSuccess,
  type FakePaystackOptions,
  fakePaystackApi,
  signedPaystackRequest,
  transferEvent,
} from "./paystack-fakes";

const DAY_MS = 86_400_000;
const DATA_KEY = Buffer.from(new Uint8Array(32).fill(7)).toString("base64");
/** ₦25 transfer fee plus ₦50 stamp duty, for payouts between ₦10,000 and ₦50,000. */
const MID_BAND_FEE = 7_500;

async function nairaMerchant(
  options: FakePaystackOptions = {},
  { amount = 5_000_000, currency = "NGN", bankCode = "058" as string | null } = {},
) {
  const paystack = fakePaystackApi(options);
  const h = await harness({ paystackApi: paystack.api });
  const sealer = await createSealer(DATA_KEY);
  const deps = { ...h.deps, sealer };
  await deps.onboarding.save({
    ...emptyOnboarding(MERCHANT.id),
    payoutCurrency: currency,
    payoutAccountName: "ADA OBI",
    payoutBankName: "Guaranty Trust Bank",
    payoutLast4: "6789",
    payoutDetails: await sealer.seal(JSON.stringify({ accountNumber: "0123456789", bankCode })),
  });
  const session = await (
    await h.call("/v1/checkout/sessions", {
      body: {
        amount,
        currency: "ngn",
        customer_email: "ada@shop.test",
        success_url: "https://shop.test/thanks",
        cancel_url: "https://shop.test/cart",
      },
    })
  ).json();
  await h.app.request(
    "/webhooks/paystack",
    signedPaystackRequest(chargeSuccess(session.id, amount)),
  );
  const scope = { id: MERCHANT.id, mode: "test" as const };
  const later = (days: number) => new Date(Date.now() + days * DAY_MS);
  const available = async (at: Date) =>
    (await merchantBalance(deps, scope, Math.floor(at.getTime() / 1000))).data.find(
      (b) => b.currency === "ngn",
    )?.available ?? 0;
  const deliver = async (payload: object) =>
    (await h.app.request("/webhooks/paystack", signedPaystackRequest(payload))).json();
  return { ...h, deps, paystack, scope, later, available, deliver };
}

async function errorOf(work: Promise<unknown>) {
  try {
    await work;
  } catch (error) {
    if (isVrsPayError(error)) return { code: error.code, message: error.message };
    throw error;
  }
  throw new Error("expected an error");
}

describe("daily payouts", () => {
  test("a cleared naira balance goes to the merchant's bank once a day, less Paystack's fee", async () => {
    const m = await nairaMerchant();
    // Paystack's own fee is ours, not the merchant's.
    const net = 5_000_000 - platformFee(money(5_000_000, "NGN"), 500).amount;
    expect(await m.available(m.later(8))).toBe(net);

    // Still inside the hold: nothing goes.
    expect(await runPayouts(m.deps, m.later(1))).toEqual([]);

    const [made] = await runPayouts(m.deps, m.later(8));
    expect(made?.payout).toMatchObject({
      object: "payout",
      status: "pending",
      amount: net - MID_BAND_FEE,
      fee: MID_BAND_FEE,
      currency: "ngn",
      rail: "paystack",
      destination: { bank_name: "Guaranty Trust Bank", last4: "6789" },
    });
    const reference = made?.payout.provider_reference ?? "";
    expect(reference).toMatch(/^po-[0-9a-z]{24}$/);
    expect(m.paystack.calls.find((c) => c.path === "/transferrecipient")?.body).toMatchObject({
      type: "nuban",
      name: "ADA OBI",
      account_number: "0123456789",
      bank_code: "058",
      currency: "NGN",
    });
    expect(m.paystack.calls.find((c) => c.path === "/transfer")?.body).toMatchObject({
      source: "balance",
      amount: net - MID_BAND_FEE,
      currency: "NGN",
      recipient: "RCP_0123456789",
      reference,
    });
    expect(await m.available(m.later(8))).toBe(0);

    // Once a day.
    expect(await runPayouts(m.deps, m.later(8))).toEqual([]);

    const paid = await m.deliver(transferEvent("transfer.success", reference, net - MID_BAND_FEE));
    expect(paid.outcome).toBe("processed");
    expect(m.state.payouts.get(made?.payout.id ?? "")?.payout.status).toBe("paid");
    expect(m.state.events.map((e) => e.event.type)).toContain("payout.paid");
    const listed = (await (await m.call("/v1/payouts")).json()).data;
    expect(listed).toMatchObject([{ id: made?.payout.id, status: "paid" }]);
    expect((await m.deliver(transferEvent("transfer.success", reference, 1))).outcome).toBe(
      "duplicate",
    );
  });

  test("a failed transfer puts the money back, and tomorrow it tries again", async () => {
    const m = await nairaMerchant({ transfer: "failed" });
    const before = await m.available(m.later(8));
    const [made] = await runPayouts(m.deps, m.later(8));
    expect(made?.payout).toMatchObject({
      status: "failed",
      failure_message: expect.stringContaining("failed"),
    });
    expect(await m.available(m.later(8))).toBe(before);
    expect(m.state.events.map((e) => e.event.type)).toContain("payout.failed");

    m.paystack.options.transfer = "pending";
    const [retry] = await runPayouts(m.deps, m.later(9));
    expect(retry?.payout.status).toBe("pending");
  });

  test("a bank that sends a paid transfer back returns the money to the balance", async () => {
    const m = await nairaMerchant({ transfer: "success" });
    const before = await m.available(m.later(8));
    const [made] = await runPayouts(m.deps, m.later(8));
    expect(made?.payout.status).toBe("paid");
    expect(await m.available(m.later(8))).toBe(0);
    const back = await m.deliver(
      transferEvent("transfer.reversed", made?.payout.provider_reference ?? "", 1),
    );
    expect(back.outcome).toBe("processed");
    expect(m.state.payouts.get(made?.payout.id ?? "")?.payout).toMatchObject({
      status: "failed",
      failure_message: expect.stringContaining("reversed"),
    });
    expect(await m.available(m.later(8))).toBe(before);
  });

  test("problems with our own Paystack account read plainly to the merchant and are logged", async () => {
    const m = await nairaMerchant({ transfer: "otp" });
    const logged: string[] = [];
    const [made] = await runPayouts(m.deps, m.later(8), (e) => logged.push(String(e)));
    expect(made?.payout).toMatchObject({
      status: "failed",
      failure_message: expect.stringContaining("the problem is on our side"),
    });
    expect(logged.join()).toContain("OTP");
  });

  test("a transfer with no answer is checked an hour later", async () => {
    const m = await nairaMerchant({ transfer: "network" });
    const [made] = await runPayouts(m.deps, m.later(8));
    expect(made?.payout.status).toBe("pending");
    await runPayouts(m.deps, new Date(m.later(8).getTime() + 2 * 3_600_000));
    expect(m.state.payouts.get(made?.payout.id ?? "")?.payout.status).toBe("paid");
    expect(m.paystack.calls.at(-1)?.path).toBe(
      `/transfer/verify/${made?.payout.provider_reference}`,
    );
  });

  test("below the minimum nothing goes, and Pay out now says why", async () => {
    const m = await nairaMerchant({}, { amount: 300_000 });
    expect(await runPayouts(m.deps, m.later(8))).toEqual([]);
    expect(await errorOf(payOutNow(m.deps, m.scope, m.later(8)))).toMatchObject({
      code: "payout_not_sent",
      message: expect.stringContaining("₦5,000.00"),
    });
    expect(m.state.payouts.size).toBe(0);
  });

  test("Pay out now sends today's payout early, once", async () => {
    const m = await nairaMerchant();
    const sent = await payOutNow(m.deps, m.scope, m.later(8));
    expect(sent).toMatchObject({ status: "pending", currency: "ngn" });
    expect(await errorOf(payOutNow(m.deps, m.scope, m.later(8)))).toMatchObject({
      message: expect.stringContaining("already been paid out today"),
    });
  });

  test("accounts in other currencies wait for Stripe Global Payouts", async () => {
    const m = await nairaMerchant({}, { currency: "GBP", bankCode: "20-00-00" });
    expect(await payoutSchedule(m.deps, m.scope)).toMatchObject({
      schedule: "daily",
      currency: "gbp",
      ready: false,
      reason: expect.stringContaining("Stripe Global Payouts"),
    });
    expect(await runPayouts(m.deps, m.later(8))).toEqual([]);
  });
});

describe("Paystack payout rail", () => {
  test("transfer fees follow Paystack's bands, plus stamp duty from ₦10,000", () => {
    const fee = (naira: number) => paystackTransferFee(money(naira * 100, "NGN")).amount / 100;
    expect([fee(5_000), fee(5_001), fee(9_999), fee(10_000), fee(50_000), fee(50_001)]).toEqual([
      10, 25, 25, 75, 75, 100,
    ]);
  });

  test("the payout sends what's left after the fee for the band it lands in", () => {
    const rail = createPaystackPayouts(fakePaystackApi().api);
    expect(payoutAmounts(rail, money(4_667_500, "NGN"))).toEqual({
      amount: money(4_660_000, "NGN"),
      fee: money(7_500, "NGN"),
    });
    // ₦10,040: sending ₦9,965 costs ₦25, but ₦10,015 would cost ₦75 — the higher fee wins.
    expect(payoutAmounts(rail, money(1_004_000, "NGN"))).toEqual({
      amount: money(996_500, "NGN"),
      fee: money(7_500, "NGN"),
    });
    expect(payoutAmounts(rail, money(500, "NGN"))).toBeNull();
  });

  test("the bank list walks every page, skips closed banks and is sorted", async () => {
    const rail = createPaystackPayouts(fakePaystackApi().api);
    expect((await rail.banks()).map((b) => b.name)).toEqual([
      "Access Bank",
      "Guaranty Trust Bank",
      "Zenith Bank",
    ]);
  });

  test("saving a naira account takes the holder's name from the bank", async () => {
    const m = await nairaMerchant({ accounts: { "0123456789": "ADA OBI" } });
    const payout = {
      currency: "NGN" as const,
      account_name: "typed by hand",
      bank_name: "Guaranty Trust Bank",
      account_number: "0123456789",
      bank_code: "058",
    };
    await updateSetup(m.deps, m.scope, { payout });
    expect((await m.deps.onboarding.get(MERCHANT.id))?.payoutAccountName).toBe("ADA OBI");
    expect(
      await errorOf(
        updateSetup(m.deps, m.scope, { payout: { ...payout, account_number: "9999999999" } }),
      ),
    ).toMatchObject({ code: "account_not_found" });
    expect(
      await errorOf(updateSetup(m.deps, m.scope, { payout: { ...payout, bank_code: undefined } })),
    ).toMatchObject({ code: "bank_required" });
  });
});
