/**
 * @vrs-pay/sdk — the server SDK and `vrs-pay push` against the real API
 * app: typed calls, errors with codes, safe retries, usage reporting and
 * webhook checks.
 */
import { describe, expect, test } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { signWebhookPayload } from "@vrs-pay/core";
import { runCli } from "../../packages/vrs-pay-sdk/src/cli";
import { VrsPay, VrsPayError } from "../../packages/vrs-pay-sdk/src/index";
import { BILLING_CONFIG, billingSetup, subscribed } from "../vrs-pay-api/billing-flows";
import { setupCompleted, stripeEvent } from "../vrs-pay-api/stripe-fixtures";

const API_URL = "http://vrs.test";

type App = { request: (url: string, init: RequestInit) => Response | Promise<Response> };

/** Sends the SDK's requests straight to the app instead of over the network. */
const through = (app: App) => async (url: string, init: RequestInit) => app.request(url, init);

async function sdk() {
  const setup = await billingSetup();
  return { ...setup, vrs: new VrsPay(setup.key, { apiUrl: API_URL, fetch: through(setup.app) }) };
}

describe("VrsPay", () => {
  test("creates and finds products and prices by lookup key", async () => {
    const { vrs } = await sdk();
    const product = await vrs.products.create({
      name: "Power",
      prices: [{ amount: 900, currency: "gbp", interval: "month", lookup_key: "power_monthly" }],
    });
    expect(product).toMatchObject({ object: "product", name: "Power" });
    const found = await vrs.prices.list({ lookup_keys: ["power_monthly"] });
    expect(found.data.map((p) => p.id)).toEqual([product.prices[0]?.id ?? ""]);
    expect((await vrs.products.retrieve(product.id)).prices).toHaveLength(1);
  });

  test("API errors become VrsPayError with the API's code", async () => {
    const { vrs } = await sdk();
    const tiny = vrs.products.create({ name: "Tiny", prices: [{ amount: 1, currency: "gbp" }] });
    await expect(tiny).rejects.toBeInstanceOf(VrsPayError);
    await expect(tiny).rejects.toMatchObject({ code: "amount_too_small", status: 400 });
    expect(() => new VrsPay("pk_test_abc", { apiUrl: API_URL })).toThrow(/publishable/);
    expect(() => new VrsPay("sk_test_abc", { apiUrl: "" })).toThrow(/apiUrl/);
  });

  test("a POST retried after a network failure reuses its idempotency key", async () => {
    const { app, customer, key, priceOf } = await sdk();
    const keys: Array<string | undefined> = [];
    let failed = false;
    const flaky = async (url: string, init: RequestInit) => {
      keys.push((init.headers as Record<string, string>)["Idempotency-Key"]);
      if (!failed) {
        failed = true;
        throw new TypeError("network down");
      }
      return app.request(url, init);
    };
    const vrs = new VrsPay(key, { apiUrl: API_URL, fetch: flaky });
    const params = {
      mode: "subscription" as const,
      price: priceOf("pro"),
      customer: customer.id,
      success_url: "https://s.test/ok",
      cancel_url: "https://s.test/no",
    };
    const session = await vrs.checkout.sessions.create(params);
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
    const again = await vrs.checkout.sessions.create(params, keys[0]);
    expect(again.id).toBe(session.id);
  });

  test("reports usage on a metered subscription and reads what's due", async () => {
    const { checkout, deliver, vrs } = await sdk();
    const product = await vrs.products.create({
      name: "API",
      prices: [{ amount: 10, currency: "gbp", interval: "month", usage_type: "metered" }],
    });
    const session = await (await checkout(product.prices[0]?.id ?? "")).json();
    await deliver(
      stripeEvent(
        "checkout.session.completed",
        setupCompleted(session.provider_reference, session.id),
      ),
    );
    await vrs.subscriptions.reportUsage(session.subscription, { quantity: 30 });
    await vrs.subscriptions.reportUsage(session.subscription, { quantity: 12 });
    expect(await vrs.subscriptions.usage(session.subscription)).toMatchObject({
      quantity: 42,
      amount_due: 420,
    });
  });

  test("checks entitlements by your own user id", async () => {
    const setup = await subscribed("pro");
    const vrs = new VrsPay(setup.key, { apiUrl: API_URL, fetch: through(setup.app) });
    expect(await vrs.entitlements.check({ external_id: "user_1" }, "custom_domains")).toBe(true);
    expect(await vrs.entitlements.check({ external_id: "user_1" }, "sso")).toBe(false);
    const session = await vrs.customerSessions.create({ customer: setup.customer.id });
    expect(session.client_secret).toBeString();
  });
});

describe("webhooks", () => {
  const SECRET = "whsec_test_secret";
  const body = JSON.stringify({ id: "evt_1", type: "invoice.paid", data: { object: {} } });

  test("a fresh signature verifies and gives the event", async () => {
    const vrs = new VrsPay("sk_test_x", { apiUrl: API_URL });
    const header = await signWebhookPayload(body, SECRET);
    expect(await vrs.webhooks.verify(body, header, SECRET)).toBe(true);
    expect((await vrs.webhooks.constructEvent(body, header, SECRET)).type).toBe("invoice.paid");
  });

  test("a changed body, wrong secret or old signature is refused", async () => {
    const vrs = new VrsPay("sk_test_x", { apiUrl: API_URL });
    const header = await signWebhookPayload(body, SECRET);
    expect(await vrs.webhooks.verify(`${body} `, header, SECRET)).toBe(false);
    expect(await vrs.webhooks.verify(body, header, "whsec_other")).toBe(false);
    expect(await vrs.webhooks.verify(body, null, SECRET)).toBe(false);
    const old = await signWebhookPayload(body, SECRET, Math.floor(Date.now() / 1000) - 600);
    expect(await vrs.webhooks.verify(body, old, SECRET)).toBe(false);
    await expect(vrs.webhooks.constructEvent(body, old, SECRET)).rejects.toThrow(/didn't verify/);
  });
});

describe("vrs-pay push", () => {
  async function project() {
    const dir = await mkdtemp(join(tmpdir(), "vrs-pay-config-"));
    await writeFile(
      join(dir, "vrs-pay.config.mjs"),
      `export default ${JSON.stringify(BILLING_CONFIG)};\n`,
    );
    return dir;
  }

  test("finds nothing to change when VRS Pay already matches the config", async () => {
    const setup = await billingSetup();
    const lines: string[] = [];
    const io = {
      cwd: await project(),
      env: { VRS_PAY_SECRET_KEY: setup.key, VRS_PAY_API_URL: API_URL },
      log: (line: string) => lines.push(line),
      fetch: through(setup.app),
    };
    // billingSetup already synced BILLING_CONFIG, so there's nothing new to send.
    expect(await runCli(["push"], io)).toBe(0);
    expect(lines).toEqual(["Nothing to change: VRS Pay already matches your config."]);
  });

  test("a new plan in the config is created", async () => {
    const setup = await billingSetup();
    const dir = await mkdtemp(join(tmpdir(), "vrs-pay-config-"));
    const config = {
      ...BILLING_CONFIG,
      plans: { ...BILLING_CONFIG.plans, max: { name: "Max", prices: { month: { GBP: 4900 } } } },
    };
    await writeFile(join(dir, "billing.mjs"), `export const config = ${JSON.stringify(config)};\n`);
    const lines: string[] = [];
    const code = await runCli(["push", "--config", "billing.mjs"], {
      cwd: dir,
      env: { VRS_PAY_SECRET_KEY: setup.key, VRS_PAY_API_URL: API_URL },
      log: (line) => lines.push(line),
      fetch: through(setup.app),
    });
    expect(code).toBe(0);
    expect(lines).toEqual(expect.arrayContaining(["Created plan max"]));
  });

  test("missing keys, configs or commands fail with a hint", async () => {
    const lines: string[] = [];
    const io = { cwd: tmpdir(), env: {}, log: (line: string) => lines.push(line) };
    expect(await runCli(["deploy"], io)).toBe(1);
    expect(await runCli(["push"], io)).toBe(1);
    const empty = await mkdtemp(join(tmpdir(), "vrs-pay-empty-"));
    const env = { VRS_PAY_SECRET_KEY: "sk_test_x", VRS_PAY_API_URL: API_URL };
    expect(await runCli(["push"], { cwd: empty, env, log: (l) => lines.push(l) })).toBe(1);
    expect(lines).toEqual([
      "Usage: vrs-pay push [--config ./vrs-pay.config.ts]",
      "Set VRS_PAY_SECRET_KEY and VRS_PAY_API_URL.",
      "vrs-pay push failed: No config found. Add vrs-pay.config.ts or pass --config.",
    ]);
  });
});
