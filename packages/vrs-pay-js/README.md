# @vrs-pay/js

> **Lightweight, framework-agnostic browser SDK for VRS Pay.**

[![npm version](https://img.shields.io/npm/v/@vrs-pay/js.svg)](https://www.npmjs.com/package/@vrs-pay/js)
[![license](https://img.shields.io/npm/l/@vrs-pay/js.svg)](https://github.com/vrs-pay/multivrs)

`@vrs-pay/js` is the core JavaScript client for VRS Pay in the browser. It works seamlessly with **any frontend framework** (Vanilla JS, React, Vue, Svelte, Angular, Solid) or static websites to load pricing plans, trigger Stripe checkout sessions, query customer billing records, and verify feature entitlements.

---

## Features

- 🌐 **Framework-agnostic**: Zero framework dependencies. Use in Vanilla JS, Vue, Svelte, Angular, React, or Astro.
- 🔒 **Safe client-side access**: Operates strictly using your publishable key (`pk_test_...` or `pk_live_...`). Rejects secret keys to prevent accidental leaks.
- 💳 **Direct Checkout**: Redirect users straight to Stripe-powered checkout sessions with custom return URLs.
- 👤 **Customer Self-Service**: Fetch active subscriptions, view past invoices, cancel or resume subscriptions.
- ⚡ **Feature Entitlements**: Query client-side feature flags and limits based on the user's active tier.
- 💱 **Price Formatting**: Built-in currency formatting utility (`formatPrice`) with localized currencies and recurring intervals.

---

## Installation

```bash
npm install @vrs-pay/js
# or
bun add @vrs-pay/js
# or
pnpm add @vrs-pay/js
```

---

## Quickstart

```ts
import { createVrsPayClient, formatPrice } from "@vrs-pay/js";

// Initialize the client
const vrs = createVrsPayClient({
  publishableKey: "pk_test_your_key",
  apiUrl: "https://your-vrs-pay-api.com",
  // Return your server-generated customer session token
  customerSession: async () => {
    const res = await fetch("/api/vrs-session");
    return res.text();
  },
});

// 1. Fetch products & pricing tiers (public, no customer required)
const products = await vrs.pricing();
const priceString = formatPrice(products[0].prices[0]); // e.g. "$29.00 / month"

// 2. Redirect to Stripe Checkout
await vrs.redirectToCheckout({
  price: products[0].prices[0].id,
  successUrl: "https://example.com/billing?status=success",
  cancelUrl: "https://example.com/pricing",
});

// 3. Manage customer subscriptions and invoices
const { subscriptions, invoices } = await vrs.customer();
if (subscriptions[0]) {
  // Cancel subscription at period end
  await vrs.cancelSubscription(subscriptions[0].id);

  // Or resume subscription
  await vrs.resumeSubscription(subscriptions[0].id);
}

// 4. Client-side entitlement checks
if (await vrs.hasFeature("csv_export")) {
  showExportButton();
}
```

---

## Which package should I use?

VRS Pay provides 3 public packages for different parts of your stack:

| Package | Environment | Compatible Frameworks | Purpose & Auth |
| :--- | :--- | :--- | :--- |
| **`@vrs-pay/js`** *(This package)* | **Browser / Client** | **ANY frontend framework** (Vanilla JS, Vue, Svelte, Angular, Solid, plain HTML) | Lightweight browser client for pricing, checkout redirects, and portal sessions. Uses your **Publishable Key** (`pk_...`). |
| **`@vrs-pay/react`** | **Browser / Client** | **swift-rust**, React 18 & 19, Next.js, Remix, Vite, Astro | Drop-in UI components (`<PricingTable />`, `<PricingComparisonTable />`, `<CustomerPortal />`, `<Gate />`) and hooks. Uses your **Publishable Key** (`pk_...`). |
| **`@vrs-pay/sdk`** | **Server / Backend** | **swift-rust (server)**, Next.js API/actions, Express, Hono, Bun, Node, Cloudflare Workers | Server SDK to create checkout sessions, issue customer tokens, and verify webhooks. Uses your **Secret Key** (`sk_...`). |

> **What about `@vrs-pay/core`?**  
> `@vrs-pay/core` is an internal private engine used by our payment API service. It is marked `"private": true` and is **never published to npm**. For your applications, only the 3 packages above are used.

---

## License

MIT © [VRS Pay](https://github.com/vrs-pay)
