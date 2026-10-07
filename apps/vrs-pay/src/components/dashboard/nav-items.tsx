import {
  Code2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Link2,
  Package,
  Radio,
  Repeat,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

/** The VRS Pay mark, inline (the shared Logo pulls tailwind-merge into this bundle). */
export function Mark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-8 shrink-0 text-brand-600"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M8.5 11.5 14 21.5l8.6-12.4M17.6 9.1h5v5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const VIEWS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "balance", label: "Balance", icon: Wallet },
  { id: "customers", label: "Customers", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: Repeat },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "products", label: "Products", icon: Package },
  { id: "links", label: "Payment links", icon: Link2 },
  { id: "developers", label: "Developers", icon: Code2 },
  { id: "events", label: "Events", icon: Radio },
  { id: "setup", label: "Account setup", icon: ShieldCheck },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type ViewId = (typeof VIEWS)[number]["id"];
