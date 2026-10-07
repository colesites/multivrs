# @vrs-pay/react

A pricing table, a customer portal and feature gates for React 18 and 19.

```tsx
import { CustomerPortal, Gate, PricingTable, VrsPayProvider } from "@vrs-pay/react";
import "@vrs-pay/react/styles.css"; // optional

export function App() {
  return (
    <VrsPayProvider
      publishableKey="pk_test_…"
      apiUrl="https://your-vrs-pay-api"
      customerSession={() => fetch("/api/vrs-session").then((r) => r.text())}
    >
      <PricingTable successUrl="https://app.example.com/billing?done=1" />
      <CustomerPortal loading={<p>Loading…</p>} />
      <Gate feature="exports" fallback={<UpgradePrompt />}>
        <ExportButton />
      </Gate>
    </VrsPayProvider>
  );
}
```

Signed out visitors can see the pricing table. Pass `onSelect` to send them to sign up instead of checkout.

## Your own design

`PricingTableView` and `CustomerPortalView` render the same markup from data you pass in. Use them with `usePricing`, `useCustomer`, `useEntitlements` and `useFeature`, or restyle the defaults with the `--vrs-*` CSS variables and `vrs-` classes in `styles.css`.

`Gate` only hides UI. Check entitlements on your server before doing paid work.
