import type Stripe from "stripe";
import type { StripeIdentityApi } from "../../apps/vrs-pay-api/src/identity/stripe-identity";
import { partial } from "./stripe-fakes";

type Session = Stripe.Identity.VerificationSession;

/** Stripe Identity sessions in memory; `update` moves one on as the merchant and Stripe would. */
export function fakeIdentityApi() {
  const sessions = new Map<string, Session>();
  const created: Stripe.Identity.VerificationSessionCreateParams[] = [];
  const api: StripeIdentityApi = {
    identity: {
      verificationSessions: {
        async create(params) {
          created.push(params);
          const id = `vs_test_${created.length}`;
          const session = partial<Session>({
            id,
            status: "requires_input",
            url: `https://verify.stripe.test/${id}`,
            last_error: null,
            verified_outputs: null,
            metadata: { vrs_merchant_id: String(params.metadata?.vrs_merchant_id) },
          });
          sessions.set(id, session);
          return session;
        },
        async retrieve(id) {
          const session = sessions.get(id);
          if (!session) throw new Error(`No such verification session: ${id}`);
          return session;
        },
      },
    },
  };
  function update(id: string, patch: Partial<Session>) {
    const session = sessions.get(id);
    if (!session) throw new Error(`No such verification session: ${id}`);
    const next = { ...session, ...patch };
    sessions.set(id, next);
    return next;
  }
  return { api, created, update };
}

/** What Stripe read off the document. */
export function documentOutputs(first: string, last: string, dob: string) {
  const [year, month, day] = dob.split("-").map(Number);
  return partial<Stripe.Identity.VerificationSession.VerifiedOutputs>({
    first_name: first,
    last_name: last,
    dob: { year: year ?? null, month: month ?? null, day: day ?? null },
  });
}

/** A Smile ID endpoint that answers every lookup with `body` and records the requests. */
export function fakeSmileId(body: unknown, status = 200) {
  const requests: Array<Record<string, unknown>> = [];
  async function fetch(_url: string, init: RequestInit): Promise<Response> {
    requests.push(JSON.parse(String(init.body)));
    return new Response(JSON.stringify(body), { status });
  }
  return { fetch, requests };
}
