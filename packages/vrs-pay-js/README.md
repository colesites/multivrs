# @vrs-pay/js

VRS Pay in the browser with your publishable key (`pk_test_…` or `pk_live_…`). It shows pricing, starts checkout, runs a customer portal and checks access. It refuses secret keys.

```ts
import { createVrsPayClient, formatPrice } from "@vrs-pay/js";

const vrs = createVrsPayClient({
  publishableKey: "pk_test_…",
  apiUrl: "https://your-vrs-pay-api",
  // Your server makes this with vrs.customerSessions.create in @vrs-pay/sdk.
  // A function is called again when the session expires.
  customerSession: () => fetch("/api/vrs-session").then((r) => r.text()),
});

const products = await vrs.pricing(); // needs no customer
const label = formatPrice(products[0].prices[0]); // "£9.00 / month"

await vrs.redirectToCheckout({ price: products[0].prices[0].id });

const { subscriptions, invoices } = await vrs.customer();
await vrs.cancelSubscription(subscriptions[0].id); // at period end
await vrs.resumeSubscription(subscriptions[0].id);

if (await vrs.hasFeature("exports")) showExportButton();
```

`hasFeature` only decides what to show. Check entitlements on your server before doing paid work.
