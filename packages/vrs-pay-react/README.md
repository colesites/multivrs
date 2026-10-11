# @vrs-pay/react

> **Full-stack billing UI, customer self-service, and feature gating for modern web applications.**

[![npm version](https://img.shields.io/npm/v/@vrs-pay/react.svg)](https://www.npmjs.com/package/@vrs-pay/react)
[![license](https://img.shields.io/npm/l/@vrs-pay/react.svg)](https://github.com/vrs-pay/multivrs)

`@vrs-pay/react` provides turnkey, production-ready React components and hooks for **swift-rust**, Next.js, and modern React web applications.

---

## Which package should I use?

VRS Pay provides 3 public packages for different parts of your stack:

| Package | Environment | Compatible Frameworks | Purpose & Auth |
| :--- | :--- | :--- | :--- |
| **`@vrs-pay/react`** *(This package)* | **Browser / Client** | **swift-rust**, React 18 & 19, Next.js, Remix, Vite, Astro | Drop-in UI components (`<PricingTable />`, `<PricingComparisonTable />`, `<CustomerPortal />`, `<Gate />`) and hooks. Uses your **Publishable Key** (`pk_...`). |
| **`@vrs-pay/js`** | **Browser / Client** | **ANY frontend framework** (Vanilla JS, Vue, Svelte, Angular, Solid, plain HTML) | Lightweight browser client for pricing, checkout redirects, and portal sessions. Uses your **Publishable Key** (`pk_...`). |
| **`@vrs-pay/sdk`** | **Server / Backend** | **swift-rust (server)**, Next.js API/actions, Express, Hono, Bun, Node, Cloudflare Workers | Server SDK to create checkout sessions, issue customer tokens, and verify webhooks. Uses your **Secret Key** (`sk_...`). |

> **What about `@vrs-pay/core`?**  
> `@vrs-pay/core` is an internal private engine used by our payment API service. It is marked `"private": true` and is **never published to npm**. For your applications, only the 3 packages above are used.

---

## Installation

```bash
npm install @vrs-pay/react @vrs-pay/js
# or
bun add @vrs-pay/react @vrs-pay/js
# or
pnpm add @vrs-pay/react @vrs-pay/js
```

---

## Quickstart

Wrap your application in `VrsPayProvider` and import the optional styling:

```tsx
import { 
  VrsPayProvider, 
  PricingTable, 
  PricingComparisonTable, 
  CustomerPortal, 
  Gate 
} from "@vrs-pay/react";
import "@vrs-pay/react/styles.css";

export function App() {
  return (
    <VrsPayProvider
      publishableKey="pk_test_..."
      apiUrl="https://your-vrs-pay-api.com"
      customerSession={() => fetch("/api/vrs-session").then((r) => r.text())}
    >
      {/* 1. Pricing Cards */}
      <PricingTable successUrl="https://app.example.com/billing?done=1" />

      {/* 2. Full Feature Comparison Matrix */}
      <PricingComparisonTable />

      {/* 3. Self-Service Customer Billing Portal */}
      <CustomerPortal />

      {/* 4. Feature-Gated UI */}
      <Gate feature="analytics" fallback={<p>Upgrade to Pro to view Analytics.</p>}>
        <AnalyticsDashboard />
      </Gate>
    </VrsPayProvider>
  );
}
```

---

## Core Components

### 1. `<PricingTable />`
Displays tiered pricing cards with:
- Monthly / Annual billing cycle toggle with discount badges
- Featured / highlighted plan badges
- Localized currency formatting
- Integrated checkout button with loading state
- Signed-out support: pass `onSelect={(plan) => ...}` to redirect unauthenticated visitors to signup instead of checkout

```tsx
<PricingTable
  successUrl="/dashboard?billing=success"
  cancelUrl="/pricing"
  onSelect={(plan) => {
    // Optional interceptor for unauthenticated users
  }}
/>
```

---

### 2. `<PricingComparisonTable />`
A detailed feature-by-feature matrix comparison grid:
- Categorized sections with collapsible groups
- Visual checkmarks (`✓`), dashes (`—`), and custom values
- Accessible tooltips for complex feature explanations
- Direct plan checkout buttons in the header row

```tsx
<PricingComparisonTable
  successUrl="/dashboard?billing=success"
  highlightedPlanId="pro_plan"
/>
```

---

### 3. `<CustomerPortal />`
A complete customer self-service billing management UI:
- View current plan, billing interval, and renewal dates
- View and download past invoices / receipts
- Change payment methods
- Pause, cancel, or resume subscriptions at the end of the billing period

```tsx
<CustomerPortal
  loading={<p>Loading billing details...</p>}
  onSubscriptionChange={() => {
    console.log("Subscription status updated");
  }}
/>
```

---

### 4. `<Gate />`
Conditionally renders UI based on customer entitlements:

```tsx
<Gate feature="export_csv" fallback={<UpgradePrompt feature="CSV Export" />}>
  <ExportButton />
</Gate>
```

> **Security Note:** `<Gate />` controls client-side UI visibility. Always enforce entitlements and permissions on your server/backend API before processing protected operations.

---

## Headless Presenters (Custom UI & Styling)

If you use Tailwind CSS, shadcn/ui, or a custom design system and want complete markup control, use our pure presenter components:

| Presenter Component | Purpose |
| :--- | :--- |
| **`PricingTableView`** | Pure presentational pricing cards without built-in data fetching |
| **`PricingComparisonTableView`** | Pure presentational feature matrix grid |
| **`CustomerPortalView`** | Pure presentational billing portal |

You can feed them data using our headless React hooks:

```tsx
import { usePricing, PricingTableView } from "@vrs-pay/react";

export function CustomPricing() {
  const { products, loading, error } = usePricing();

  if (loading) return <div>Loading...</div>;

  return (
    <PricingTableView
      plans={products}
      onChoose={(plan) => console.log("Selected plan:", plan)}
    />
  );
}
```

---

## React Hooks

- **`useVrsPay()`**: Access the underlying client instance and configuration.
- **`usePricing()`**: Fetches published products, plans, and pricing tiers.
- **`useCustomer()`**: Fetches active subscriptions, invoices, and billing profile.
- **`useEntitlements()`**: Retrieves all granted feature flags and access limits.
- **`useFeature(featureKey)`**: Reactive boolean checking if the current user has access to a specific feature.

---

## Not Using React? Use `@vrs-pay/js`

If you are building in **Vanilla JavaScript**, **Vue**, **Svelte**, **Angular**, or **Solid**, use `@vrs-pay/js` directly (or import the re-exported client from `@vrs-pay/react`):

```ts
import { createVrsPayClient, formatPrice } from "@vrs-pay/js";

const vrs = createVrsPayClient({
  publishableKey: "pk_test_...",
  apiUrl: "https://your-vrs-pay-api.com",
  customerSession: () => fetch("/api/vrs-session").then((r) => r.text()),
});

// 1. Fetch products & pricing
const products = await vrs.pricing();

// 2. Start Stripe checkout
await vrs.redirectToCheckout({ price: products[0].prices[0].id });

// 3. Check customer feature access
if (await vrs.hasFeature("unlimited_seats")) {
  showSeatManager();
}
```

---

## Styling & Themes

`@vrs-pay/react` includes a sleek design language with dark mode and smooth animations out of the box.

### 1. Import CSS
```ts
import "@vrs-pay/react/styles.css";
```

### 2. Dark Mode
Toggle dark mode by setting the `data-vrs-theme` attribute on any parent container or `<html>`:
```html
<html data-vrs-theme="dark">
```

### 3. CSS Variable Overrides
All colors, radii, and fonts are customizable via CSS variables:
```css
:root {
  --vrs-accent: #6936f5;
  --vrs-accent-hover: #5724d9;
  --vrs-radius: 16px;
  --vrs-font: "Inter", sans-serif;
}
```

---

## License

MIT © [VRS Pay](https://github.com/vrs-pay)
