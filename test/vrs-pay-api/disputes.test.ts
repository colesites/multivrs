/**
 * vrs-pay-api — chargebacks: what Stripe takes back (the amount and its
 * dispute fee) comes out of the merchant's balance, comes back when they
 * win, and the merchant hears about each step.
 */
import { describe, expect, test } from "bun:test";
import { computeBalances, creditBalance } from "@vrs-pay/core";
import { createStripeProvider } from "../../apps/vrs-pay-api/src/providers/stripe/stripe.provider";
import { paidPayment } from "./flows";
import { fakeStripeApi, WEBHOOK_SECRET } from "./stripe-fakes";
import { signedStripeRequest, stripeEvent } from "./stripe-fixtures";

const MERCHANT_BALANCE = { kind: "merchant_balance", owner: "mer_test" } as const;
const DUE_BY = 1_900_000_000;

type Move = { amount: number; fee: number; currency?: string };

/** A Stripe dispute with the balance moves Stripe made for it so far. */
function dispute(
  paymentIntent: string,
  status: string,
  moves: Move[],
  extra: { amount?: number; currency?: string; id?: string } = {},
) {
  return {
    id: extra.id ?? "dp_test_1",
    object: "dispute",
    amount: extra.amount ?? 4900,
    currency: extra.currency ?? "gbp",
    charge: "ch_test_1",
    payment_intent: paymentIntent,
    reason: "fraudulent",
    status,
    evidence_details: { due_by: DUE_BY },
    balance_transactions: moves.map((m, i) => ({
      id: `txn_dp_${i}`,
      object: "balance_transaction",
      amount: m.amount,
      fee: m.fee,
      currency: m.currency ?? "gbp",
    })),
  };
}

const WITHDRAWN: Move = { amount: -4900, fee: 2000 };
const REINSTATED: Move = { amount: 4900, fee: 0 };

async function disputedPayment() {
  const flow = await paidPayment();
  const send = (type: string, object: object) => flow.deliver(stripeEvent(type, object));
  const balance = () =>
    creditBalance(
      computeBalances(flow.state.ledger.map((p) => p.transaction)),
      MERCHANT_BALANCE,
      "GBP",
    );
  return { ...flow, send, balance };
}

describe("chargebacks", () => {
  test("a chargeback takes the amount and the dispute fee out of the balance and tells the merchant", async () => {
    const { call, send, balance, paymentReference, paymentId, state } = await disputedPayment();
    // 4900 paid, less our 285 fee.
    expect(balance()).toBe(4615);

    const opened = await send(
      "charge.dispute.created",
      dispute(paymentReference, "needs_response", [WITHDRAWN]),
    );
    expect(opened.outcome).toBe("processed");
    expect(balance()).toBe(4615 - 4900 - 2000);

    const { data } = await (await call("/v1/disputes")).json();
    expect(data).toMatchObject([
      {
        object: "dispute",
        status: "open",
        amount: 4900,
        currency: "gbp",
        amount_withdrawn: 4900,
        fee: 2000,
        reason: "fraudulent",
        evidence_due_by: DUE_BY,
        payment: paymentId,
        provider_reference: "dp_test_1",
      },
    ]);
    expect((await (await call(`/v1/disputes/${data[0].id}`)).json()).id).toBe(data[0].id);
    expect(state.events.map((e) => e.event.type)).toEqual(["payment.succeeded", "dispute.created"]);

    // Stripe's other notifications about the same state change nothing.
    const again = await send(
      "charge.dispute.funds_withdrawn",
      dispute(paymentReference, "needs_response", [WITHDRAWN]),
    );
    expect(again.outcome).toBe("duplicate");
    expect(balance()).toBe(4615 - 4900 - 2000);
  });

  test("winning gives the amount back; the fee Stripe kept stays charged", async () => {
    const { call, send, balance, paymentReference, state } = await disputedPayment();
    await send("charge.dispute.created", dispute(paymentReference, "needs_response", [WITHDRAWN]));
    // Evidence sent: still open, nothing for the merchant to hear about.
    const reviewing = await send(
      "charge.dispute.updated",
      dispute(paymentReference, "under_review", [WITHDRAWN]),
    );
    expect(reviewing.outcome).toBe("duplicate");
    const won = await send(
      "charge.dispute.closed",
      dispute(paymentReference, "won", [WITHDRAWN, REINSTATED]),
    );
    expect(won.outcome).toBe("processed");
    expect(balance()).toBe(4615 - 2000);
    const [record] = (await (await call("/v1/disputes")).json()).data;
    expect(record).toMatchObject({
      status: "won",
      amount_withdrawn: 0,
      fee: 2000,
      evidence_due_by: null,
    });
    expect(state.events.map((e) => e.event.type)).toEqual([
      "payment.succeeded",
      "dispute.created",
      "dispute.closed",
    ]);
  });

  test("a returned fee goes back too; a lost dispute keeps everything out", async () => {
    const won = await disputedPayment();
    await won.send(
      "charge.dispute.closed",
      dispute(won.paymentReference, "won", [WITHDRAWN, { amount: 4900, fee: -2000 }]),
    );
    expect(won.balance()).toBe(4615);

    const lost = await disputedPayment();
    await lost.send(
      "charge.dispute.created",
      dispute(lost.paymentReference, "needs_response", [WITHDRAWN]),
    );
    await lost.send("charge.dispute.closed", dispute(lost.paymentReference, "lost", [WITHDRAWN]));
    expect(lost.balance()).toBe(4615 - 4900 - 2000);
    expect(lost.state.events.at(-1)?.event).toMatchObject({
      type: "dispute.closed",
      data: { object: { status: "lost" } },
    });
  });

  test("an inquiry takes nothing until it becomes a chargeback; one that closes counts as won", async () => {
    const { send, balance, paymentReference, state } = await disputedPayment();
    await send("charge.dispute.created", dispute(paymentReference, "warning_needs_response", []));
    expect(balance()).toBe(4615);
    await send("charge.dispute.closed", dispute(paymentReference, "warning_closed", []));
    expect(balance()).toBe(4615);
    expect([...state.disputes.values()][0]?.dispute.status).toBe("won");
    expect(state.ledger.filter((p) => p.source.type === "dispute")).toHaveLength(0);
  });

  test("disputes on payments VRS Pay didn't make are ignored, and merchants only see their own", async () => {
    const { call, otherKey, send, paymentReference, state } = await disputedPayment();
    const stranger = await send(
      "charge.dispute.created",
      dispute("pi_someone_else", "needs_response", [WITHDRAWN], { id: "dp_other" }),
    );
    expect(stranger.outcome).toBe("ignored");
    expect(state.disputes.size).toBe(0);

    await send("charge.dispute.created", dispute(paymentReference, "needs_response", [WITHDRAWN]));
    const [record] = [...state.disputes.values()];
    const theirs = await call(`/v1/disputes/${record?.dispute.id}`, { key: otherKey });
    expect(theirs.status).toBe(404);
    expect((await (await call("/v1/disputes", { key: otherKey })).json()).data).toEqual([]);
  });
});

describe("Stripe dispute parsing", () => {
  async function parse(object: object, type = "charge.dispute.created") {
    const { api } = fakeStripeApi();
    const provider = createStripeProvider({ api, webhookSecrets: [WEBHOOK_SECRET] });
    const request = await signedStripeRequest(stripeEvent(type, object));
    return provider.parseWebhook({ rawBody: request.body, headers: new Headers(request.headers) });
  }

  test("a dispute in another currency gets its fee converted at the withdrawal's rate", async () => {
    // $50.00 disputed; Stripe took £39.50 and a £20 fee from the GBP balance.
    const event = await parse(
      dispute("pi_usd", "needs_response", [{ amount: -3950, fee: 2000 }], {
        amount: 5000,
        currency: "usd",
      }),
    );
    expect(event).toMatchObject({
      type: "dispute.updated",
      data: {
        disputeReference: "dp_test_1",
        paymentReference: "pi_usd",
        status: "open",
        amount: { amount: 5000, currency: "USD" },
        withdrawn: { amount: 5000, currency: "USD" },
        fee: { amount: 2532, currency: "USD" },
        evidenceDueBy: DUE_BY,
      },
    });
  });
});
