/**
 * vrs-pay-api — automatic ID checks: Didit NIN lookups, Stripe Identity
 * document checks, name matching, and which provider runs when.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError } from "@vrs-pay/core";
import { createDiditVerifier } from "../../apps/vrs-pay-api/src/identity/didit";
import {
  identityFromEnv,
  routeIdentity,
} from "../../apps/vrs-pay-api/src/identity/identity-router";
import { isoDate, namesMatch, nameTokens } from "../../apps/vrs-pay-api/src/identity/name-match";
import { createDocumentVerifier } from "../../apps/vrs-pay-api/src/identity/stripe-identity";
import { sandboxVerifier } from "../../apps/vrs-pay-api/src/identity/verifiers";
import { diditAnswer, documentOutputs, fakeDidit, fakeIdentityApi } from "./identity-fakes";

const ADA = { firstName: "Ada", lastName: "Okafor", dateOfBirth: "1990-04-12" };
const NIN_CHECK = {
  ...ADA,
  merchantId: "mer_1",
  country: "NG",
  idType: "nin",
  idNumber: "22345678901",
};
const BVN_CHECK = { ...NIN_CHECK, idType: "bvn" };
const PASSPORT_CHECK = { ...NIN_CHECK, country: "GB", idType: "passport", idNumber: "123456789" };

function didit(body: unknown, status = 200) {
  const fake = fakeDidit(body, status);
  const verifier = createDiditVerifier({ apiKey: "didit-key", fetch: fake.fetch });
  return { ...fake, verifier };
}

async function errorCode(work: Promise<unknown>) {
  const error = await work.catch((e) => e);
  return isVrsPayError(error) ? [error.status, error.code] : error;
}

describe("name matching", () => {
  test("accents, case, order and extra middle names don't matter; missing names do", () => {
    expect(nameTokens("Adébáyọ̀ O'Neil")).toEqual(["adebayo", "oneil"]);
    expect(namesMatch(["OKAFOR ADA CHIOMA"], ADA)).toBe(true);
    expect(namesMatch(["Ada", "Okafor-Nwosu"], ADA)).toBe(true);
    expect(namesMatch(["ADAEZE OKAFOR"], ADA)).toBe(false);
    expect(namesMatch([null, null], ADA)).toBe(false);
    expect(isoDate("1990-04-12T00:00:00Z")).toBe("1990-04-12");
    expect(isoDate("12/04/1990")).toBeNull();
  });
});

describe("Didit NIN lookups", () => {
  test("sends the NIN, name and birth date to Nigeria's National ID service", async () => {
    const { requests, verifier } = didit(diditAnswer("MATCH"));
    expect(await verifier.verify(NIN_CHECK)).toEqual({ status: "verified" });
    expect(requests[0]).toEqual({
      url: "https://verification.didit.me/v3/database-validation/",
      apiKey: "didit-key",
      fields: {
        issuing_state: "NGA",
        services: "nga_national_id",
        national_id: "22345678901",
        first_name: "Ada",
        last_name: "Okafor",
        date_of_birth: "1990-04-12",
      },
    });
  });

  test("a partial match passes when the record is still the merchant's", async () => {
    const surnameFirst = { full_name: "OKAFOR ADA CHIOMA", date_of_birth: "1990-04-12" };
    const { verifier } = didit(diditAnswer("PARTIAL_MATCH", surnameFirst));
    expect(await verifier.verify(NIN_CHECK)).toEqual({ status: "verified" });
    const otherDob = { ...surnameFirst, date_of_birth: "1991-01-01" };
    expect(
      await didit(diditAnswer("PARTIAL_MATCH", otherDob)).verifier.verify(NIN_CHECK),
    ).toMatchObject({ status: "failed", reason: expect.stringContaining("date of birth") });
    const someoneElse = { full_name: "BELLO MUSA", date_of_birth: "1990-04-12" };
    expect(
      await didit(diditAnswer("PARTIAL_MATCH", someoneElse)).verifier.verify(NIN_CHECK),
    ).toMatchObject({ status: "failed", reason: expect.stringContaining("name") });
  });

  test("unknown numbers and minors fail with a reason", async () => {
    for (const [outcome, words] of [
      ["NO_MATCH", "couldn't find"],
      ["DOCUMENT_NOT_FOUND", "couldn't find"],
      ["MINOR_BLOCKED", "at least 18"],
    ] as const) {
      expect(await didit(diditAnswer(outcome)).verifier.verify(NIN_CHECK)).toMatchObject({
        status: "failed",
        reason: expect.stringContaining(words),
      });
    }
  });

  test("registry outages and server errors ask the merchant to retry instead of deciding", async () => {
    const unavailable = [503, "identity_check_unavailable"];
    expect(
      await errorCode(didit(diditAnswer("REGISTRY_UNAVAILABLE")).verifier.verify(NIN_CHECK)),
    ).toEqual(unavailable);
    expect(await errorCode(didit(diditAnswer("INCONCLUSIVE")).verifier.verify(NIN_CHECK))).toEqual(
      unavailable,
    );
    expect(await errorCode(didit({ detail: "bad key" }, 403).verifier.verify(NIN_CHECK))).toEqual(
      unavailable,
    );
    expect(await errorCode(didit({ nothing: true }).verifier.verify(NIN_CHECK))).toEqual(
      unavailable,
    );
  });

  test("only NINs are looked up; BVN and other IDs aren't", () => {
    const { verifier } = didit(diditAnswer("MATCH"));
    expect(verifier.supports("NG", "nin")).toBe(true);
    expect(verifier.supports("NG", "bvn")).toBe(false);
    expect(verifier.supports("GH", "ghana_card")).toBe(false);
  });
});

describe("Stripe Identity document checks", () => {
  test("start a session for the right document, with a live selfie", async () => {
    const stripe = fakeIdentityApi();
    const verifier = createDocumentVerifier({
      api: stripe.api,
      returnUrl: "https://vrs.test/setup",
    });
    const result = await verifier.verify(PASSPORT_CHECK);
    expect(result).toMatchObject({
      status: "pending",
      session: { id: "vs_test_1", url: "https://verify.stripe.test/vs_test_1" },
    });
    expect(stripe.created[0]).toMatchObject({
      type: "document",
      client_reference_id: "mer_1",
      metadata: { vrs_merchant_id: "mer_1" },
      return_url: "https://vrs.test/setup",
      options: {
        document: {
          allowed_types: ["passport"],
          require_live_capture: true,
          require_matching_selfie: true,
        },
      },
    });
  });

  test("the document must show the merchant's own name and birth date", async () => {
    const stripe = fakeIdentityApi();
    const verifier = createDocumentVerifier({ api: stripe.api, returnUrl: "https://vrs.test" });
    await verifier.verify(PASSPORT_CHECK);
    expect(await verifier.resume("vs_test_1", ADA)).toMatchObject({
      status: "pending",
      session: { url: "https://verify.stripe.test/vs_test_1" },
    });
    stripe.update("vs_test_1", { status: "processing", url: null });
    expect(await verifier.resume("vs_test_1", ADA)).toMatchObject({
      status: "pending",
      session: { url: null },
    });
    stripe.update("vs_test_1", {
      status: "verified",
      verified_outputs: documentOutputs("Ada Chioma", "Okafor", "1990-04-12"),
    });
    expect(await verifier.resume("vs_test_1", ADA)).toEqual({ status: "verified" });
    expect(await verifier.resume("vs_test_1", { ...ADA, dateOfBirth: "1990-04-13" })).toMatchObject(
      { status: "failed", reason: expect.stringContaining("date of birth") },
    );
    stripe.update("vs_test_1", {
      status: "requires_input",
      last_error: { code: "selfie_face_mismatch", reason: null },
    });
    expect(await verifier.resume("vs_test_1", ADA)).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("selfie"),
    });
  });
});

describe("which check runs", () => {
  test("NINs go to Didit; BVN and everything else to a document check", async () => {
    const lookups = didit(diditAnswer("MATCH"));
    const stripe = fakeIdentityApi();
    const documents = createDocumentVerifier({ api: stripe.api, returnUrl: "https://vrs.test" });
    const both = routeIdentity({ registry: lookups.verifier, documents });
    expect(await both?.verify(NIN_CHECK)).toEqual({ status: "verified" });
    expect((await both?.verify(BVN_CHECK))?.status).toBe("pending");
    expect((await both?.verify(PASSPORT_CHECK))?.status).toBe("pending");
    expect([lookups.requests.length, stripe.created.length]).toEqual([1, 2]);
    const didItOnly = routeIdentity({ registry: lookups.verifier });
    expect(await errorCode(didItOnly?.verify(PASSPORT_CHECK) ?? Promise.resolve())).toEqual([
      400,
      "id_type_unsupported",
    ]);
    expect(routeIdentity({})).toBeUndefined();
  });

  test("servers with a database never use a sandbox", () => {
    const options = { returnUrl: "https://vrs.test" };
    expect(identityFromEnv({}, { ...options, database: false })).toBe(sandboxVerifier);
    expect(identityFromEnv({}, { ...options, database: true })).toBeUndefined();
    const testKeyOnly = { STRIPE_SECRET_KEY: "sk_test_123" };
    expect(identityFromEnv(testKeyOnly, { ...options, database: true })).toBeUndefined();
    const live = identityFromEnv(
      { STRIPE_LIVE_SECRET_KEY: "sk_live_123" },
      { ...options, database: true },
    );
    expect(typeof live?.resume).toBe("function");
    const diditOnly = identityFromEnv({ DIDIT_API_KEY: "k" }, { ...options, database: true });
    expect(diditOnly).toBeDefined();
    expect(diditOnly?.resume).toBeUndefined();
  });
});
