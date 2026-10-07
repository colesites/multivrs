/**
 * vrs-pay-api — automatic ID checks: Smile ID registry lookups, Stripe
 * Identity document checks, name matching, and which provider runs when.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError } from "@vrs-pay/core";
import {
  identityFromEnv,
  routeIdentity,
} from "../../apps/vrs-pay-api/src/identity/identity-router";
import { isoDate, namesMatch, nameTokens } from "../../apps/vrs-pay-api/src/identity/name-match";
import {
  createSmileIdVerifier,
  smileIdSignature,
} from "../../apps/vrs-pay-api/src/identity/smile-id";
import { createDocumentVerifier } from "../../apps/vrs-pay-api/src/identity/stripe-identity";
import { sandboxVerifier } from "../../apps/vrs-pay-api/src/identity/verifiers";
import { documentOutputs, fakeIdentityApi, fakeSmileId } from "./identity-fakes";

const ADA = { firstName: "Ada", lastName: "Okafor", dateOfBirth: "1990-04-12" };
const BVN_CHECK = {
  ...ADA,
  merchantId: "mer_1",
  country: "NG",
  idType: "bvn",
  idNumber: "22345678901",
};
const PASSPORT_CHECK = { ...BVN_CHECK, country: "GB", idType: "passport", idNumber: "123456789" };
const VALIDATED = {
  ResultCode: "1012",
  ResultText: "ID Number Validated",
  FullName: "OKAFOR ADA CHIOMA",
  DOB: "1990-04-12",
  Actions: { Verify_ID_Number: "Verified", Return_Personal_Info: "Returned" },
};

function smileId(body: unknown, status = 200) {
  const fake = fakeSmileId(body, status);
  const verifier = createSmileIdVerifier({
    partnerId: "085",
    apiKey: "smile-api-key",
    server: "sandbox",
    fetch: fake.fetch,
  });
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

describe("Smile ID", () => {
  test("signs requests the way Smile ID's SDKs do", () => {
    expect(smileIdSignature("085", "smile-api-key", "2026-10-07T12:00:00.000Z")).toBe(
      "yJLC5XTkRy4cjGIIOUBXKLphNCz6isSEHhkcms0ODg8=",
    );
  });

  test("a BVN whose name and birth date match is verified on the spot", async () => {
    const { verifier, requests } = smileId(VALIDATED);
    expect(await verifier.verify(BVN_CHECK)).toEqual({ status: "verified" });
    expect(requests[0]).toMatchObject({
      partner_id: "085",
      country: "NG",
      id_type: "BVN",
      id_number: "22345678901",
      dob: "1990-04-12",
      partner_params: { user_id: "mer_1", job_type: 5 },
    });
    expect(String(requests[0]?.signature)).toHaveLength(44);
  });

  test("unknown numbers, other people's IDs and wrong birth dates fail with a reason", async () => {
    const notFound = smileId({ ResultCode: "1013", ResultText: "ID Number Not Found" });
    expect(await notFound.verifier.verify(BVN_CHECK)).toMatchObject({ status: "failed" });
    const someoneElse = smileId({ ...VALIDATED, FullName: "BELLO MUSA" });
    expect(await someoneElse.verifier.verify(BVN_CHECK)).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("name"),
    });
    const wrongDob = smileId({ ...VALIDATED, DOB: "1991-01-01" });
    expect(await wrongDob.verifier.verify(BVN_CHECK)).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("date of birth"),
    });
    const noDobOnRecord = smileId({ ...VALIDATED, DOB: "Not Available" });
    expect(await noDobOnRecord.verifier.verify(BVN_CHECK)).toEqual({ status: "verified" });
  });

  test("registry outages and server errors ask the merchant to retry instead of deciding", async () => {
    const down = smileId({ ResultCode: "1015", ResultText: "ID Authority Unavailable" });
    expect(await errorCode(down.verifier.verify(BVN_CHECK))).toEqual([
      503,
      "identity_check_unavailable",
    ]);
    const broken = smileId({ code: "2203", error: "Invalid signature" }, 401);
    expect(await errorCode(broken.verifier.verify(BVN_CHECK))).toEqual([
      503,
      "identity_check_unavailable",
    ]);
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
  test("registry IDs go to Smile ID; the rest to a document check", async () => {
    const smile = smileId(VALIDATED);
    const stripe = fakeIdentityApi();
    const documents = createDocumentVerifier({ api: stripe.api, returnUrl: "https://vrs.test" });
    const both = routeIdentity({ smileId: smile.verifier, documents });
    expect(await both?.verify(BVN_CHECK)).toEqual({ status: "verified" });
    expect((await both?.verify(PASSPORT_CHECK))?.status).toBe("pending");
    expect([smile.requests.length, stripe.created.length]).toEqual([1, 1]);
    const smileOnly = routeIdentity({ smileId: smile.verifier });
    expect(await errorCode(smileOnly?.verify(PASSPORT_CHECK) ?? Promise.resolve())).toEqual([
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
    const sandbox = { SMILE_ID_PARTNER_ID: "085", SMILE_ID_API_KEY: "k", SMILE_ID_ENV: "sandbox" };
    expect(() => identityFromEnv(sandbox, { ...options, database: true })).toThrow("sandbox");
    expect(identityFromEnv(sandbox, { ...options, database: false })).not.toBe(sandboxVerifier);
  });
});
