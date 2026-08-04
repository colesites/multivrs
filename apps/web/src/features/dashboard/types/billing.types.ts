import type { AddOnKey, PlanKey } from "@/lib/payments/billing.types";

export type BillingAddOnSummary = {
  key: AddOnKey;
  projectIds: string[];
  quantity: number;
};

export type BillingInvoiceSummary = {
  amountDueCents: number;
  currency: string;
  hostedInvoiceUrl: string | null;
  id: string;
  status: string;
};

export type BillingProjectOption = { id: string; name: string };

export type BillingScopeSummary = {
  addOns: BillingAddOnSummary[];
  canManage: boolean;
  currentPeriodEnd: string | null;
  estimatedUsageCents: number;
  invoices: BillingInvoiceSummary[];
  name: string;
  overagesEnabled: boolean;
  plan: PlanKey;
  projects: BillingProjectOption[];
  scopeId: string;
  spendAlertCents: number | null;
  spendLimitCents: number | null;
  status: string;
  subscriptionId: string | null;
};

export type BillingOverview = { scopes: BillingScopeSummary[] };
