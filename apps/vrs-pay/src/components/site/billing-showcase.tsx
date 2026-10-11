"use client";

import { useState } from "react";
import {
  type ComparisonPlan,
  type ComparisonSection,
  type PricingProduct,
  PricingComparisonTableView,
  PricingTableView,
} from "@/components/vrs-pay";
import { highlight } from "@/lib/highlight";
import { Check, Code2, Eye, Sparkles } from "lucide-react";

// Mock products representing a SaaS with monthly and annual options
const DEMO_PRODUCTS: PricingProduct[] = [
  {
    id: "starter",
    object: "product",
    name: "Starter",
    description: "For independent builders, hackathons, and early prototypes.",
    images: [],
    marketing_features: [
      { name: "Up to 500 payments / mo" },
      { name: "Hosted checkout links" },
      { name: "Standard 7-day payout" },
      { name: "Community Discord support" },
    ],
    trial_days: 0,
    features: {},
    prices: [
      {
        id: "starter_m",
        amount: 0,
        currency: "usd",
        currency_options: {},
        interval: "month",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
      {
        id: "starter_y",
        amount: 0,
        currency: "usd",
        currency_options: {},
        interval: "year",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
    ],
  },
  {
    id: "pro",
    object: "product",
    name: "Pro",
    description: "For scaling SaaS apps, digital goods, and growing teams.",
    images: [],
    marketing_features: [
      { name: "Unlimited monthly volume" },
      { name: "Custom domain checkout" },
      { name: "Next-day rolling payouts" },
      { name: "Customer billing portal" },
      { name: "Automatic tax & invoicing" },
      { name: "Webhook event streams" },
    ],
    trial_days: 14,
    features: { highlighted: true },
    prices: [
      {
        id: "pro_m",
        amount: 2900,
        currency: "usd",
        currency_options: {},
        interval: "month",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
      {
        id: "pro_y",
        amount: 24000,
        currency: "usd",
        currency_options: {},
        interval: "year",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
    ],
  },
  {
    id: "scale",
    object: "product",
    name: "Enterprise",
    description: "For high-volume platforms requiring dedicated payment rails.",
    images: [],
    marketing_features: [
      { name: "Interchange-plus pricing" },
      { name: "Multi-merchant sub-accounts" },
      { name: "Same-day instant payouts" },
      { name: "Dedicated Slack channel" },
      { name: "99.99% uptime SLA" },
    ],
    trial_days: 0,
    features: {},
    prices: [
      {
        id: "scale_m",
        amount: 14900,
        currency: "usd",
        currency_options: {},
        interval: "month",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
      {
        id: "scale_y",
        amount: 120000,
        currency: "usd",
        currency_options: {},
        interval: "year",
        interval_count: 1,
        usage_type: "licensed",
        lookup_key: null,
      },
    ],
  },
];

const COMPARISON_PLANS: ComparisonPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    description: "Free forever for building",
    ctaText: "Start free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/ month",
    description: "Scale with zero payment headaches",
    highlighted: true,
    badge: "Most popular",
    ctaText: "Start 14-day trial",
  },
  {
    id: "scale",
    name: "Enterprise",
    price: "$149",
    period: "/ month",
    description: "High-volume custom rails",
    ctaText: "Contact sales",
  },
];

const COMPARISON_SECTIONS: ComparisonSection[] = [
  {
    title: "Payments & Rails",
    rows: [
      {
        name: "Hosted Checkout & Links",
        description: "Branded 1-click checkout pages",
        values: { starter: true, pro: true, scale: true },
      },
      {
        name: "Drop-in Pricing Table & Comparison Table",
        description: "Drop in with React or HTML",
        values: { starter: true, pro: true, scale: true },
      },
      {
        name: "Custom domain checkout",
        description: "pay.yourdomain.com",
        values: { starter: false, pro: true, scale: true },
      },
      {
        name: "Transaction rate",
        values: {
          starter: "2.9% + 30¢",
          pro: "2.4% + 30¢",
          scale: "Custom IC+",
        },
      },
    ],
  },
  {
    title: "Billing & Subscriptions",
    rows: [
      {
        name: "Customer Portal drop-in",
        description: "Self-service cancel & resume",
        values: { starter: false, pro: true, scale: true },
      },
      {
        name: "Usage-based metering",
        description: "Proration & tiered reporting",
        values: { starter: false, pro: true, scale: true },
      },
      {
        name: "Automated Invoicing & Tax",
        description: "VAT & GST auto-computed",
        values: { starter: "10 / mo", pro: "Unlimited", scale: "Custom" },
      },
    ],
  },
  {
    title: "Platform & Payouts",
    rows: [
      {
        name: "Payout schedule",
        values: { starter: "7 days", pro: "Next-day", scale: "Instant" },
      },
      {
        name: "Webhooks & Typed API",
        values: { starter: true, pro: true, scale: true },
      },
      {
        name: "Dedicated support",
        values: { starter: "Discord", pro: "Priority email", scale: "24/7 Slack" },
      },
    ],
  },
];

const ACCENTS = [
  { name: "Violet", color: "#6936f5" },
  { name: "Emerald", color: "#10b981" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Obsidian", color: "#18181b" },
];

const CODE_EXAMPLES = {
  cards: `import { PricingTable } from "@vrs-pay/react";
import "@vrs-pay/react/styles.css";

export function Pricing() {
  return (
    <PricingTable
      highlightedId="pro"
      appearance={{
        accent: "#6936f5",
        radius: 20,
        theme: "light",
      }}
      onSelect={(price) => console.log("Selected price:", price.id)}
    />
  );
}`,
  matrix: `import { PricingComparisonTable } from "@vrs-pay/react";
import "@vrs-pay/react/styles.css";

export function FullPricing() {
  return (
    <PricingComparisonTable
      sections={SECTIONS}
      appearance={{
        accent: "#6936f5",
        radius: 20,
      }}
    />
  );
}`,
  api: `import { VrsPay } from "@vrs-pay/sdk";

const vrs = new VrsPay(process.env.VRS_SECRET_KEY);

// Create checkout session with customer entitlement
const session = await vrs.checkout.sessions.create({
  mode: "subscription",
  price: "price_pro_monthly",
  customer: "cus_9xK23L",
  success_url: "https://acme.dev/billing?paid=1",
});

return Response.redirect(session.url, 303);`,
};

export function BillingShowcase() {
  const [activeMode, setActiveMode] = useState<"ui" | "code">("ui");
  const [viewType, setViewType] = useState<"cards" | "table">("cards");
  const [period, setPeriod] = useState<"month:1" | "year:1">("month:1");
  const [accent, setAccent] = useState("#6936f5");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [codeTab, setCodeTab] = useState<"cards" | "matrix" | "api">("cards");

  return (
    <div className="reveal overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_40px_90px_-30px_rgba(11,11,18,0.12)]">
      {/* Top Bar: Mode switcher & Customizer controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-wash/80 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-1.5 rounded-full border border-line bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveMode("ui")}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === "ui"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            <Eye className="size-3.5" />
            <span>Drop-in UI Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("code")}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeMode === "code"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-mute hover:text-ink"
            }`}
          >
            <Code2 className="size-3.5" />
            <span>Code Integration</span>
          </button>
        </div>

        {activeMode === "ui" ? (
          <div className="flex flex-wrap items-center gap-3">
            {/* Cards vs Table Switcher (Kontinue AI style pill segmented bar) */}
            <div className="flex items-center rounded-full border border-neutral-200/80 bg-neutral-100/80 p-1 text-xs font-semibold shadow-xs">
              <button
                type="button"
                onClick={() => setViewType("cards")}
                className={`rounded-full px-4 py-1.5 transition-all cursor-pointer ${
                  viewType === "cards"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Pricing Table
              </button>
              <button
                type="button"
                onClick={() => setViewType("table")}
                className={`rounded-full px-4 py-1.5 transition-all cursor-pointer ${
                  viewType === "table"
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Comparison Table
              </button>
            </div>

            {/* Accent Color Picker */}
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] text-mute font-mono">Accent:</span>
              <div className="flex items-center gap-1">
                {ACCENTS.map((item) => (
                  <button
                    key={item.color}
                    type="button"
                    title={item.name}
                    onClick={() => setAccent(item.color)}
                    className="grid size-5 place-items-center rounded-full border border-black/10 transition-transform hover:scale-110"
                    style={{ backgroundColor: item.color }}
                  >
                    {accent === item.color && (
                      <Check className="size-3 text-white drop-shadow-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink hover:bg-wash transition-colors"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white p-0.5 text-xs font-medium text-mute">
            <button
              type="button"
              onClick={() => setCodeTab("cards")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                codeTab === "cards"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "hover:text-ink"
              }`}
            >
              PricingTable
            </button>
            <button
              type="button"
              onClick={() => setCodeTab("matrix")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                codeTab === "matrix"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "hover:text-ink"
              }`}
            >
              ComparisonTable
            </button>
            <button
              type="button"
              onClick={() => setCodeTab("api")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                codeTab === "api"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "hover:text-ink"
              }`}
            >
              Server SDK
            </button>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      {activeMode === "ui" ? (
        <div
          className={`p-6 sm:p-10 transition-colors ${
            theme === "dark" ? "bg-[#0b0b12]" : "bg-[#fafaf9]"
          }`}
        >
          {viewType === "cards" ? (
            <div className="w-full max-w-5xl mx-auto">
              <PricingTableView
                products={DEMO_PRODUCTS}
                periods={["month:1", "year:1"]}
                period={period}
                onPeriodChange={(p) => setPeriod(p as "month:1" | "year:1")}
                onChoose={(price, product) => {
                  alert(`Demo checkout triggered for ${product.name} (${price.interval})`);
                }}
                highlightedId="pro"
                highlightedBadge="Most popular"
                appearance={{
                  accent,
                  theme,
                  radius: 20,
                }}
              />
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto">
              <PricingComparisonTableView
                plans={COMPARISON_PLANS}
                sections={COMPARISON_SECTIONS}
                onChoose={(plan) => {
                  alert(`Demo checkout triggered for ${plan.name}`);
                }}
                appearance={{
                  accent,
                  theme,
                  radius: 20,
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0d0d15] p-5 sm:p-7 min-h-[380px]">
          <pre className="overflow-x-auto font-mono text-[12.5px] leading-[1.8] text-[#e4e4ec] sm:text-[13px]">
            <code>{highlight(CODE_EXAMPLES[codeTab])}</code>
          </pre>
        </div>
      )}

      {/* Bottom status bar */}
      <div className="flex flex-wrap items-center justify-between border-t border-line bg-wash/60 px-6 py-2.5 text-xs text-mute">
        <span className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-brand-600" />
          <span>Interactive React component from <strong>@vrs-pay/react</strong></span>
        </span>
        <span className="font-mono text-[11px] text-mute">
          1-click checkout & customer portal integrated
        </span>
      </div>
    </div>
  );
}
