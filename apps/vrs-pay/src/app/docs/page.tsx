import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { highlight } from "@/lib/highlight";

export const metadata = {
  title: "Docs",
  description:
    "Get API keys, take a payment, start subscriptions and verify webhooks with VRS Pay.",
};

const API_URL = "https://vrs-pay-api.multivrs.space";

const SECTIONS = [
  { id: "keys", label: "API keys" },
  { id: "install", label: "Install the SDK" },
  { id: "payments", label: "Take a payment" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "webhooks", label: "Webhooks" },
  { id: "react", label: "Pricing UI" },
  { id: "live", label: "Test and live" },
] as const;

const EVENTS = [
  ["payment.succeeded", "A payment was captured."],
  ["refund.succeeded", "A refund was sent back to the customer."],
  ["refund.failed", "A refund couldn't be completed."],
  ["checkout.session.expired", "A checkout wasn't finished in time."],
  ["subscription.created", "A subscription started, including trials."],
  [
    "subscription.updated",
    "A subscription's plan, quantity or status changed.",
  ],
  ["subscription.canceled", "A subscription ended."],
  ["subscription.past_due", "A renewal failed and is being retried."],
  ["invoice.paid", "An invoice was paid."],
  ["invoice.payment_failed", "An invoice payment failed."],
  ["entitlements.updated", "A customer's plans or features changed."],
] as const;

const INSTALL = `bun add @vrs-pay/sdk
# or: npm install @vrs-pay/sdk`;

const CLIENT = `import { VrsPay } from "@vrs-pay/sdk";

export const vrs = new VrsPay(process.env.VRS_PAY_SECRET_KEY!, {
  apiUrl: "${API_URL}",
});`;

const PAYMENT = `const session = await vrs.checkout.sessions.create({
  amount: 4900, // in minor units: £49.00
  currency: "gbp",
  description: "Pro licence",
  success_url: "https://your-app.com/thanks",
  cancel_url: "https://your-app.com/cart",
});

// Send the buyer to the hosted checkout page.
return Response.redirect(session.url, 303);`;

const PLANS = `// vrs-pay.config.ts
import { defineConfig } from "@vrs-pay/sdk";

export default defineConfig({
  features: { exports: "boolean", seats: "limit" },
  plans: {
    pro: {
      name: "Pro",
      trial_days: 14,
      features: { exports: true, seats: 5 },
      prices: { month: { GBP: 900 } },
    },
  },
});`;

const PUSH = `VRS_PAY_SECRET_KEY=sk_test_… VRS_PAY_API_URL=${API_URL} bunx vrs-pay push`;

const SUBSCRIBE = `const [pro] = (await vrs.prices.list({ lookup_keys: ["pro_monthly"] })).data;
const customer = await vrs.customers.findByExternalId(user.id);

const session = await vrs.checkout.sessions.create({
  mode: "subscription",
  price: pro.id,
  customer: customer.id,
  success_url: "https://your-app.com/billing?done=1",
  cancel_url: "https://your-app.com/billing",
});

// Later, before paid work:
const allowed = await vrs.entitlements.check({ external_id: user.id }, "exports");`;

const WEBHOOK = `export async function POST(request: Request) {
  const event = await vrs.webhooks.constructEvent(
    await request.text(), // the raw body, not parsed JSON
    request.headers.get("VRS-Signature"),
    process.env.VRS_PAY_WEBHOOK_SECRET!,
  );

  switch (event.type) {
    case "payment.succeeded":
      // Fulfil the order. Use event.id to skip repeats.
      break;
    case "subscription.canceled":
      // Remove access.
      break;
  }

  return new Response(null, { status: 204 });
}`;

const SESSION = `// On your server, after sign-in: a 30-minute secret for the browser.
const { client_secret } = await vrs.customerSessions.create({
  external_id: user.id,
  email: user.email,
});`;

const REACT = `import { PricingTable, VrsPayProvider } from "@vrs-pay/react";
import "@vrs-pay/react/styles.css";

export function Pricing() {
  return (
    <VrsPayProvider
      publishableKey="pk_test_…"
      apiUrl="${API_URL}"
      customerSession={() => fetch("/api/vrs-session").then((r) => r.text())}
    >
      <PricingTable successUrl="https://your-app.com/billing?done=1" />
    </VrsPayProvider>
  );
}`;

function Code({ file, code }: { file: string; code: string }) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-[#0d0d15] ring-1 ring-black/5">
      <figcaption className="border-b border-white/8 px-4 py-2.5 font-mono text-[11px] text-white/50">
        {file}
      </figcaption>
      <pre
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard-reachable
        tabIndex={0}
        className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.75] text-[#e4e4ec] sm:p-5"
      >
        <code>{highlight(code)}</code>
      </pre>
    </figure>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-28 border-t border-line pt-10 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${id}-title`}
        className="text-2xl font-medium tracking-[-0.02em] text-ink"
      >
        {title}
      </h2>
      <div className="mt-4 grid gap-4 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-[#f3f2fa] px-1.5 py-0.5 font-mono text-[13px] text-ink">
      {children}
    </code>
  );
}

export default function DocsPage() {
  return (
    <>
      <SiteNav overHero={false} />
      <main className="mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 sm:pt-36">
        <header className="max-w-2xl">
          <p className="eyebrow text-brand-600">Documentation</p>
          <h1 className="mt-4 text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] font-light tracking-[-0.04em] text-ink">
            <span className="font-display block">Start</span>
            accepting payments
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
            Everything you need to take your first payment: keys, the server
            SDK, checkout, subscriptions and webhooks.
          </p>
        </header>

        <div className="mt-14 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)]">
          <nav
            aria-label="On this page"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <p className="eyebrow text-mute">On this page</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm lg:flex-col">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-ink-soft transition-colors hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid min-w-0 max-w-3xl gap-10">
            <Section id="keys" title="API keys">
              <p>
                <a href="/sign-up" className="text-brand-600 hover:underline">
                  Create an account
                </a>
                , then open <strong>Developers → API keys</strong> in the
                dashboard. There are two kinds:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <Mono>sk_test_…</Mono> / <Mono>sk_live_…</Mono> secret keys,
                  for your server only. Never put them in a browser or an app.
                </li>
                <li>
                  <Mono>pk_test_…</Mono> / <Mono>pk_live_…</Mono> publishable
                  keys, safe to use in the browser with{" "}
                  <Mono>@vrs-pay/react</Mono> or <Mono>@vrs-pay/js</Mono>.
                </li>
              </ul>
              <p>
                Every request goes to <Mono>{API_URL}</Mono>. A key is only
                shown once when you create it; if you lose one, revoke it and
                make another.
              </p>
            </Section>

            <Section id="install" title="Install the SDK">
              <Code file="terminal" code={INSTALL} />
              <p>
                Create one client and reuse it. It works in Node, Bun,
                swift-rust, Next.js and Cloudflare Workers.
              </p>
              <Code file="lib/vrs.ts" code={CLIENT} />
            </Section>

            <Section id="payments" title="Take a payment">
              <p>
                Create a checkout session on your server and redirect the buyer
                to its <Mono>url</Mono>. Amounts are whole numbers in the
                currency's smallest unit, so <Mono>4900</Mono> in{" "}
                <Mono>gbp</Mono> is £49.00.
              </p>
              <Code file="checkout.ts" code={PAYMENT} />
              <p>
                When the payment goes through, the buyer lands on your{" "}
                <Mono>success_url</Mono> and your webhook endpoint receives{" "}
                <Mono>payment.succeeded</Mono>. Fulfil orders from the webhook,
                not the redirect, since buyers can close the tab first.
              </p>
            </Section>

            <Section id="subscriptions" title="Subscriptions">
              <p>
                Describe your plans in code and push them on every deploy. Only
                what changed is written.
              </p>
              <Code file="vrs-pay.config.ts" code={PLANS} />
              <Code file="terminal" code={PUSH} />
              <p>
                Then start a subscription checkout for a signed-in user and
                check their access before doing paid work.
              </p>
              <Code file="subscribe.ts" code={SUBSCRIBE} />
            </Section>

            <Section id="webhooks" title="Webhooks">
              <p>
                In <strong>Developers → Webhook endpoints</strong>, add your URL
                and pick all events or just the ones you need. Copy the signing
                secret, which is shown once, and verify every request with it.
              </p>
              <Code file="api/vrs-webhooks.ts" code={WEBHOOK} />
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Reply with any <Mono>2xx</Mono> quickly. Anything else is
                  retried after 1 min, 5 min, 30 min, 2 h, 5 h, 10 h and 24 h,
                  then marked failed.
                </li>
                <li>
                  An event can arrive more than once, so skip any{" "}
                  <Mono>event.id</Mono> you've already handled.
                </li>
                <li>
                  Each endpoint's <strong>Deliveries</strong> show every attempt
                  and its response, and you can resend any of them.
                </li>
                <li>
                  <strong>Send test</strong> posts a <Mono>webhook.test</Mono>{" "}
                  event. Return <Mono>2xx</Mono> for event types you don't
                  handle.
                </li>
              </ul>
              <div className="overflow-hidden rounded-2xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf9fd] text-xs text-mute">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Event
                      </th>
                      <th scope="col" className="px-4 py-2.5 font-medium">
                        Sent when
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EVENTS.map(([type, when]) => (
                      <tr key={type} className="border-t border-line">
                        <td className="px-4 py-2.5 font-mono text-[12.5px] text-ink">
                          {type}
                        </td>
                        <td className="px-4 py-2.5">{when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="react" title="Pricing UI">
              <p>
                <Mono>@vrs-pay/react</Mono> renders pricing tables, a comparison
                table, a customer portal and feature gates from your plans. It
                uses a publishable key plus a short-lived customer session your
                server creates.
              </p>
              <Code file="server.ts" code={SESSION} />
              <Code file="pricing.tsx" code={REACT} />
            </Section>

            <Section id="live" title="Test and live">
              <p>
                New accounts start in test mode: nothing is charged, and you can
                pay with the card <Mono>4242 4242 4242 4242</Mono>, any future
                expiry date and any CVC.
              </p>
              <p>
                To take real payments, finish <strong>Account setup</strong> in
                the dashboard. Then switch to live mode and create live keys and
                a live webhook endpoint; test and live keep separate keys,
                endpoints and data.
              </p>
            </Section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
