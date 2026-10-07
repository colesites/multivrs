import { createProviderRegistry } from "@vrs-pay/core";
import { createApp } from "../../apps/vrs-pay-api/src/app";
import type { DashboardAuth, DashboardUser } from "../../apps/vrs-pay-api/src/app.types";
import { createSealer } from "../../apps/vrs-pay-api/src/lib/sealer";
import { harness } from "./harness";
import { fakeStripeApi } from "./stripe-fakes";

export const ORIGIN = "http://localhost:3210";
const ADA: DashboardUser = {
  id: "user_ada",
  email: "ada@shop.test",
  name: "Ada Lovelace",
  image: null,
};

/** Signed in when the request carries `Cookie: session=<user id>`. */
function fakeAuth(users: DashboardUser[]): DashboardAuth {
  return {
    origin: ORIGIN,
    socialProviders: ["github"],
    handler: async () => new Response("auth handler", { status: 200 }),
    async session(headers) {
      const id = /session=([\w-]+)/.exec(headers.get("Cookie") ?? "")?.[1];
      return users.find((u) => u.id === id) ?? null;
    },
  };
}

interface DashInit {
  method?: string;
  body?: unknown;
  as?: string | null;
  /** The business (`VRS-Merchant`) and mode (`VRS-Mode`) the dashboard is showing. */
  merchant?: string;
  mode?: "test" | "live";
}

/**
 * The app with a fake login system, signed in as Ada unless `as` says
 * otherwise. `liveProviders: false` leaves live mode without credentials.
 */
export async function dashboardHarness(options: { liveProviders?: boolean } = {}) {
  const stripe = fakeStripeApi();
  const h = await harness({ stripeApi: stripe.api });
  const key = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
  const sealer = await createSealer(key);
  const live =
    options.liveProviders === false
      ? { providers: createProviderRegistry(), platformProviders: [] }
      : h.deps.modes.live;
  const deps = { ...h.deps, modes: { ...h.deps.modes, live }, auth: fakeAuth([ADA]), sealer };
  const app = createApp(deps);
  const dash = (path: string, init: DashInit = {}) =>
    app.request(`/dashboard${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: {
        Origin: ORIGIN,
        "Content-Type": "application/json",
        ...(init.as === null ? {} : { Cookie: `session=${init.as ?? ADA.id}` }),
        ...(init.merchant ? { "VRS-Merchant": init.merchant } : {}),
        ...(init.mode ? { "VRS-Mode": init.mode } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  return { ...h, app, deps, dash, sealer, stripe, user: ADA };
}
