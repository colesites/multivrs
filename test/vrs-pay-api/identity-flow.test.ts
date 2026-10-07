/**
 * vrs-pay-api — a document check from start to finish: the dashboard gets
 * Stripe's link, and Stripe's webhook (or the next visit) records the
 * result. Nobody approves anything by hand.
 */
import { describe, expect, test } from "bun:test";
import { routeIdentity } from "../../apps/vrs-pay-api/src/identity/identity-router";
import { createDocumentVerifier } from "../../apps/vrs-pay-api/src/identity/stripe-identity";
import { dashboardHarness } from "./dashboard-harness";
import { documentOutputs, fakeIdentityApi } from "./identity-fakes";
import { signedStripeRequest, stripeEvent } from "./stripe-fixtures";

const UK_PASSPORT = {
  country: "GB",
  id_type: "passport",
  id_number: "123456789",
  first_name: "Ada",
  last_name: "Lovelace",
  date_of_birth: "1990-12-10",
};

async function setUp() {
  const stripe = fakeIdentityApi();
  const documents = createDocumentVerifier({ api: stripe.api, returnUrl: "https://vrs.test" });
  const h = await dashboardHarness({ identity: routeIdentity({ stripe: documents }) });
  const identity = async () => (await (await h.dash("/setup")).json()).details.identity;
  const deliver = async (type: string, id: string, merchantId?: string) => {
    const session = {
      id,
      object: "identity.verification_session",
      metadata: { vrs_merchant_id: merchantId },
    };
    const res = await h.app.request(
      "/webhooks/stripe",
      await signedStripeRequest(stripeEvent(type, session)),
    );
    return (await res.json()).outcome;
  };
  const merchantId: string = (await (await h.dash("/me")).json()).merchant.id;
  return { ...h, stripe, identity, deliver, merchantId };
}

describe("document checks", () => {
  test("verifying hands back Stripe's link; the webhook records the result", async () => {
    const { dash, stripe, identity, deliver, merchantId } = await setUp();
    const started = await (await dash("/setup/identity", { body: UK_PASSPORT })).json();
    expect(started.details.identity).toMatchObject({
      status: "pending",
      verification_url: "https://verify.stripe.test/vs_test_1",
    });
    expect(started.steps.find((s: { id: string }) => s.id === "identity").done).toBe(false);
    expect((await identity()).verification_url).toBe("https://verify.stripe.test/vs_test_1");

    stripe.update("vs_test_1", {
      status: "verified",
      url: null,
      verified_outputs: documentOutputs("Ada", "Lovelace", "1990-12-10"),
    });
    expect(await deliver("identity.verification_session.verified", "vs_test_1", merchantId)).toBe(
      "processed",
    );
    expect(await identity()).toMatchObject({
      status: "verified",
      reason: null,
      verification_url: null,
    });
  });

  test("coming back from Stripe's page picks up the result even before the webhook", async () => {
    const { dash, stripe, identity } = await setUp();
    await dash("/setup/identity", { body: UK_PASSPORT });
    stripe.update("vs_test_1", { status: "processing", url: null });
    expect(await identity()).toMatchObject({
      status: "pending",
      reason: expect.stringContaining("checking your document"),
      verification_url: null,
    });
    stripe.update("vs_test_1", {
      status: "requires_input",
      last_error: { code: "document_expired", reason: null },
    });
    expect(await identity()).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("expired"),
    });
  });

  test("old sessions and other apps' sessions on the same Stripe account are ignored", async () => {
    const { dash, stripe, identity, deliver, merchantId } = await setUp();
    await dash("/setup/identity", { body: UK_PASSPORT });
    await dash("/setup/identity", { body: UK_PASSPORT });
    stripe.update("vs_test_1", {
      status: "verified",
      verified_outputs: documentOutputs("Ada", "Lovelace", "1990-12-10"),
    });
    expect(await deliver("identity.verification_session.verified", "vs_test_1", merchantId)).toBe(
      "ignored",
    );
    expect(await deliver("identity.verification_session.verified", "vs_test_2")).toBe("ignored");
    expect((await identity()).status).toBe("pending");
  });
});
