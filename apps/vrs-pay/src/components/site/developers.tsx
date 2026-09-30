import {
  ArrowUpRight,
  CreditCard,
  FlaskConical,
  Landmark,
  Receipt,
  Repeat,
  Webhook,
} from "lucide-react";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { highlight } from "@/lib/highlight";
import { SectionHeading } from "./section-heading";

// Illustrative API surface for the landing page — keep in sync with the SDK
// once it ships.
const TABS = [
  {
    id: "server",
    file: "checkout.ts",
    code: `import { VrsPay } from "@vrs-pay/sdk";

const vrs = new VrsPay(process.env.VRS_SECRET_KEY);

// Charge in the buyer's currency, settle in yours.
const session = await vrs.checkout.create({
  amount: 4900,
  currency: "usd",
  settle_in: "eur",
  customer: "cus_8fQ2kLx",
  methods: ["card", "apple_pay", "sepa_debit"],
  success_url: "https://acme.dev/thanks",
});

return Response.redirect(session.url, 303);`,
  },
  {
    id: "react",
    file: "pricing.tsx",
    code: `import { PricingTable, VrsProvider } from "@vrs-pay/react";

export default function Pricing() {
  return (
    <VrsProvider publishableKey="pk_test_51Hx9...">
      <PricingTable
        plans={["starter", "pro", "scale"]}
        currency="auto"
        interval="month"
      />
    </VrsProvider>
  );
}`,
  },
  {
    id: "webhook",
    file: "webhook.ts",
    code: `import { VrsPay } from "@vrs-pay/sdk";

const vrs = new VrsPay(process.env.VRS_SECRET_KEY);

export async function POST(req: Request) {
  // Verifies the signature and rejects replays.
  const event = await vrs.webhooks.verify(req);

  switch (event.type) {
    case "payment.succeeded":
      await fulfillOrder(event.data.order_id);
      break;
    case "subscription.renewed":
      await extendAccess(event.data.customer);
      break;
  }

  return new Response(null, { status: 204 });
}`,
  },
] as const;

const CAPABILITIES = [
  {
    icon: CreditCard,
    title: "Checkout & payment links",
    body: "Hosted, embedded or fully custom.",
  },
  {
    icon: Repeat,
    title: "Subscriptions & usage billing",
    body: "Seats, metering, trials and proration.",
  },
  {
    icon: Landmark,
    title: "Local payouts",
    body: "Pay sellers in their own currency.",
  },
  {
    icon: Webhook,
    title: "Signed, retried webhooks",
    body: "Backoff and replay protection built in.",
  },
  {
    icon: Receipt,
    title: "Tax & invoicing",
    body: "VAT and GST calculated per market.",
  },
  {
    icon: FlaskConical,
    title: "Test mode, free forever",
    body: "Sandbox cards, simulated FX and payouts.",
  },
];

export function Developers() {
  return (
    <section
      id="developers"
      aria-labelledby="developers-title"
      className="relative scroll-mt-24 overflow-x-clip"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            id="developers-title"
            align="left"
            eyebrow="For developers"
            lead="Ship billing"
            rest="in an afternoon"
          >
            Typed SDKs, idempotent APIs and webhooks that retry until they land.
            Drop in hosted checkout or build your own — the API is the same
            either way.
          </SectionHeading>

          <div className="reveal mt-8 inline-flex max-w-full items-center gap-3 rounded-full border border-line bg-wash py-1.5 pr-1.5 pl-4 font-mono text-[13px] text-ink">
            <span className="text-mute select-none" aria-hidden="true">
              $
            </span>
            <span className="truncate">bun add @vrs-pay/sdk</span>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] text-mute ring-1 ring-line">
              typed
            </span>
          </div>

          <ul className="reveal mt-10 grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Icon className="size-4" />
                </span>
                <span>
                  <span className="block text-[14.5px] font-medium text-ink">
                    {title}
                  </span>
                  <span className="block text-[13.5px] leading-snug text-mute">
                    {body}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="reveal mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 rounded-full px-6">
              <a href="/docs">Read the docs</a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-full px-6"
            >
              <a href="/docs/api">
                API reference <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 bg-[radial-gradient(closest-side,var(--color-brand-100),transparent)]"
          />
          <CodeWindow />
        </div>
      </div>
    </section>
  );
}

function CodeWindow() {
  return (
    <div className="code-tabs reveal overflow-hidden rounded-[24px] bg-[#0d0d15] shadow-[0_50px_100px_-40px_rgb(42_18_112/0.65)] ring-1 ring-black/5">
      <div className="flex items-center gap-4 border-b border-white/8 px-4 py-3">
        <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </div>
        <div
          role="radiogroup"
          aria-label="Code example"
          className="flex gap-1 overflow-x-auto"
        >
          {TABS.map((tab, i) => (
            <Fragment key={tab.id}>
              <input
                type="radio"
                name="code-example"
                id={`tab-${tab.id}`}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <label htmlFor={`tab-${tab.id}`}>{tab.file}</label>
            </Fragment>
          ))}
        </div>
      </div>

      {TABS.map((tab) => (
        <section
          key={tab.id}
          data-panel={tab.id}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard-reachable
          tabIndex={0}
          aria-label={`${tab.file} example`}
          className="min-h-[392px] overflow-x-auto"
        >
          <pre className="w-max p-5 font-mono text-[12.5px] leading-[1.8] text-[#e4e4ec] sm:p-6 sm:text-[13px]">
            <code>{highlight(tab.code)}</code>
          </pre>
        </section>
      ))}

      <div className="flex items-center justify-between border-t border-white/8 px-5 py-3 font-mono text-[11px] text-white/50">
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
          Test mode
        </span>
        <span>200 OK · 84 ms</span>
      </div>
    </div>
  );
}
