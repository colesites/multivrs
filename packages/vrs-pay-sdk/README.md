# @vrs-pay/sdk

VRS Pay for your server. Use it with your secret key (`sk_test_…` or `sk_live_…`). Never ship that key to a browser. For browsers, use `@vrs-pay/js` or `@vrs-pay/react`.

```ts
import { VrsPay } from "@vrs-pay/sdk";

const vrs = new VrsPay(process.env.VRS_PAY_SECRET_KEY!, {
  apiUrl: process.env.VRS_PAY_API_URL!,
});

// Find prices by lookup key so your code never hard codes ids.
const [pro] = (await vrs.prices.list({ lookup_keys: ["pro_monthly"] })).data;

// Start a subscription checkout for a signed in user.
const customer = await vrs.customers.findByExternalId(user.id);
const session = await vrs.checkout.sessions.create({
  mode: "subscription",
  price: pro.id,
  customer: customer.id,
  success_url: "https://app.example.com/billing?done=1",
  cancel_url: "https://app.example.com/billing",
});
// Send the user to session.url

// Check access before doing paid work.
if (!(await vrs.entitlements.check({ external_id: user.id }, "exports"))) {
  throw new Error("Upgrade to export.");
}

// Report usage on a metered price. The idempotency key makes retries safe.
await vrs.subscriptions.reportUsage(subscriptionId, { quantity: 120 }, `api-calls/${batchId}`);
```

## Browser sessions

Your login code makes a short lived secret for `@vrs-pay/js` and `@vrs-pay/react`. It lasts 30 minutes.

```ts
const { client_secret } = await vrs.customerSessions.create({ external_id: user.id, email: user.email });
```

## Webhooks

Pass the raw body, not parsed JSON.

```ts
const body = await request.text();
const event = await vrs.webhooks.constructEvent(
  body,
  request.headers.get("VRS-Signature"),
  process.env.VRS_PAY_WEBHOOK_SECRET!,
);
```

## Errors and retries

Failed calls throw `VrsPayError` with `code`, `type` and `status`. POST requests get an `Idempotency-Key` automatically, and a network failure or 5xx is retried once with the same key, so a retry never charges twice. Set `maxRetries` to change that.

## Plans as code

`vrs-pay push` sends `vrs-pay.config.ts` to VRS Pay. Run it on every deploy. It only writes what changed.

```ts
// vrs-pay.config.ts
import { defineConfig } from "@vrs-pay/sdk";

export default defineConfig({
  features: { exports: "boolean", seats: "limit" },
  plans: {
    pro: { name: "Pro", trial_days: 14, features: { exports: true, seats: 5 }, prices: { month: { GBP: 900 } } },
  },
});
```

```sh
VRS_PAY_SECRET_KEY=sk_test_… VRS_PAY_API_URL=https://… bunx vrs-pay push
```

The CLI runs on Bun for now. The config covers monthly, yearly and one time prices. Create metered prices, other billing periods and currency options with `vrs.products.create` or in the dashboard.
