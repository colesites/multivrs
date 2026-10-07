/**
 * vrs-pay-api — automatic ID checks: Didit document checks and NIN
 * lookups, Stripe Identity as the backup, name matching, and which
 * provider runs when.
 */
import { describe, expect, test } from "bun:test";
import { isVrsPayError } from "@vrs-pay/core";
import { createDiditLookup } from "../../apps/vrs-pay-api/src/identity/didit";
import { createDiditDocumentVerifier } from "../../apps/vrs-pay-api/src/identity/didit-session";
import {
  identityFromEnv,
  routeIdentity,
} from "../../apps/vrs-pay-api/src/identity/identity-router";
import { isoDate, namesMatch, nameTokens } from "../../apps/vrs-pay-api/src/identity/name-match";
import { createDocumentVerifier } from "../../apps/vrs-pay-api/src/identity/stripe-identity";
import { sandboxVerifier } from "../../apps/vrs-pay-api/src/identity/verifiers";
import {
  diditAnswer,
  documentOutputs,
  fakeDidit,
  fakeDiditSessions,
  fakeIdentityApi,
} from "./identity-fakes";

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
  const verifier = createDiditLookup({ apiKey: "didit-key", fetch: fake.fetch });
  return { ...fake, verifier };
}

function diditDocuments(options: { allowSandbox?: boolean } = {}) {
  const fake = fakeDiditSessions();
  const verifier = createDiditDocumentVerifier({
    apiKey: "didit-key",
    workflowId: "wf_1",
    returnUrl: "https://vrs.test/setup",
    fetch: fake.fetch,
    ...options,
  });
  return { ...fake, verifier };
}

const READ_ADA = [{ full_name: "OKAFOR ADA CHIOMA", date_of_birth: "1990-04-12" }];

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

describe("Didit document checks", () => {
  test("start a session on the workflow, tied to the merchant", async () => {
    const didit = diditDocuments();
    const result = await didit.verifier.verify(NIN_CHECK);
    const id = "0b6c3f5e-0000-4000-8000-000000000001";
    expect(result).toEqual({
      status: "pending",
      reason: expect.stringContaining("selfie"),
      session: { id, url: `https://verify.didit.test/${id}` },
    });
    expect(didit.created[0]).toEqual({
      workflow_id: "wf_1",
      vendor_data: "mer_1",
      callback: "https://vrs.test/setup",
      metadata: { vrs_merchant_id: "mer_1" },
    });
  });

  test("an approved document must show the merchant's own name and birth date", async () => {
    const didit = diditDocuments();
    const { session } = (await didit.verifier.verify(NIN_CHECK)) as { session: { id: string } };
    expect(await didit.verifier.resume(session.id, ADA)).toMatchObject({
      status: "pending",
      session: { url: `https://verify.didit.test/${session.id}` },
    });
    didit.update(session.id, { status: "In Review" });
    expect(await didit.verifier.resume(session.id, ADA)).toMatchObject({
      status: "pending",
      session: { url: null },
    });
    didit.update(session.id, { status: "Approved", id_verifications: READ_ADA });
    expect(await didit.verifier.resume(session.id, ADA)).toEqual({ status: "verified" });
    expect(
      await didit.verifier.resume(session.id, { ...ADA, dateOfBirth: "1990-04-13" }),
    ).toMatchObject({ status: "failed", reason: expect.stringContaining("date of birth") });
    expect(await didit.verifier.resume(session.id, { ...ADA, firstName: "Bisi" })).toMatchObject({
      status: "failed",
      reason: expect.stringContaining("name"),
    });
  });

  test("declined, abandoned and sandbox checks fail with a reason", async () => {
    const didit = diditDocuments();
    const { session } = (await didit.verifier.verify(NIN_CHECK)) as { session: { id: string } };
    for (const [status, words] of [
      ["Declined", "couldn't verify"],
      ["Abandoned", "wasn't finished"],
      ["Expired", "wasn't finished"],
    ] as const) {
      didit.update(session.id, { status });
      expect(await didit.verifier.resume(session.id, ADA)).toMatchObject({
        status: "failed",
        reason: expect.stringContaining(words),
      });
    }
    didit.update(session.id, {
      status: "Approved",
      environment: "sandbox",
      id_verifications: READ_ADA,
    });
    expect((await didit.verifier.resume(session.id, ADA)).status).toBe("failed");
    const local = diditDocuments({ allowSandbox: true });
    const started = (await local.verifier.verify(NIN_CHECK)) as { session: { id: string } };
    local.update(started.session.id, {
      status: "Approved",
      environment: "sandbox",
      id_verifications: READ_ADA,
    });
    expect(await local.verifier.resume(started.session.id, ADA)).toEqual({ status: "verified" });
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
  test("Didit runs the document check; Stripe takes over when Didit is down", async () => {
    const didit = diditDocuments();
    const stripe = fakeIdentityApi();
    const backup = createDocumentVerifier({ api: stripe.api, returnUrl: "https://vrs.test" });
    const identity = routeIdentity({ didit: didit.verifier, stripe: backup });
    const first = await identity?.verify(BVN_CHECK);
    expect([didit.created.length, stripe.created.length]).toEqual([1, 0]);
    didit.setDown(true);
    const second = await identity?.verify(PASSPORT_CHECK);
    expect([didit.created.length, stripe.created.length]).toEqual([1, 1]);
    didit.setDown(false);
    // Each session is resumed with the provider that started it.
    const idOf = (r: unknown) => (r as { session: { id: string } }).session.id;
    didit.update(idOf(first), { status: "Approved", id_verifications: READ_ADA });
    expect(await identity?.resume?.(idOf(first), ADA)).toEqual({ status: "verified" });
    expect(idOf(second)).toBe("vs_test_1");
    expect((await identity?.resume?.(idOf(second), ADA))?.status).toBe("pending");
  });

  test("the paid NIN lookup answers NINs; every other ID gets a document check", async () => {
    const lookups = didit(diditAnswer("MATCH"));
    const documents = diditDocuments();
    const identity = routeIdentity({ registry: lookups.verifier, didit: documents.verifier });
    expect(await identity?.verify(NIN_CHECK)).toEqual({ status: "verified" });
    expect((await identity?.verify(BVN_CHECK))?.status).toBe("pending");
    expect([lookups.requests.length, documents.created.length]).toEqual([1, 1]);
    const lookupOnly = routeIdentity({ registry: lookups.verifier });
    expect(await errorCode(lookupOnly?.verify(PASSPORT_CHECK) ?? Promise.resolve())).toEqual([
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
    const didit = { DIDIT_API_KEY: "k", DIDIT_WORKFLOW_ID: "wf_1" };
    expect(typeof identityFromEnv(didit, { ...options, database: true })?.resume).toBe("function");
    const lookupOnly = { DIDIT_API_KEY: "k", DIDIT_NIN_LOOKUP: "on" };
    expect(identityFromEnv(lookupOnly, { ...options, database: true })?.resume).toBeUndefined();
  });

  test("half-configured Didit settings stop the server instead of being ignored", () => {
    const options = { returnUrl: "https://vrs.test", database: true };
    expect(() => identityFromEnv({ DIDIT_API_KEY: "k" }, options)).toThrow("DIDIT_WORKFLOW_ID");
    expect(() => identityFromEnv({ DIDIT_NIN_LOOKUP: "on" }, options)).toThrow("DIDIT_API_KEY");
  });
});
