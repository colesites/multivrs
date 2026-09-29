import { Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "./logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["Payments", "/payments"],
      ["Billing", "/billing"],
      ["Payouts", "/payouts"],
      ["Checkout", "/checkout"],
      ["Pricing", "/pricing"],
    ],
  },
  {
    title: "Developers",
    links: [
      ["Documentation", "/docs"],
      ["API reference", "/docs/api"],
      ["SDKs", "/docs/sdks"],
      ["Changelog", "/changelog"],
      ["Status", "/status"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Customers", "/customers"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/legal/privacy"],
      ["Terms", "/legal/terms"],
      ["Security", "/security"],
      ["DPA", "/legal/dpa"],
    ],
  },
] as const;

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    </svg>
  );
}

const SOCIALS = [
  {
    label: "VRS Pay on X",
    href: "https://x.com",
    icon: <XLogo className="size-4" />,
  },
  {
    label: "VRS Pay on GitHub",
    href: "https://github.com",
    icon: <Github className="size-4" />,
  },
  {
    label: "VRS Pay on LinkedIn",
    href: "https://www.linkedin.com",
    icon: <Linkedin className="size-4" />,
  },
];

// Scattered specks of light, as on the reference footer.
const SPECKS = [
  "top-[9%] left-[18%] size-1.5",
  "top-[24%] left-[28%] size-1",
  "top-[16%] right-[30%] size-1",
  "top-[34%] right-[17%] size-2",
  "top-[40%] left-[11%] size-1.5",
];

export function SiteFooter() {
  return (
    <footer className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="grain overflow-hidden rounded-[28px] bg-brand-600 text-white sm:rounded-[44px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(80%_55%_at_50%_0%,rgb(255_255_255/0.18),transparent_70%)]"
        />
        {SPECKS.map((c) => (
          <span
            key={c}
            aria-hidden="true"
            className={`absolute hidden rounded-full bg-white/80 md:block ${c}`}
          />
        ))}

        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
          <div className="reveal mx-auto grid size-[76px] place-items-center rounded-[24px] bg-white shadow-[0_24px_50px_-16px_rgb(20_8_70/0.65)]">
            <LogoMark className="size-11 text-brand-600" />
          </div>
          <h2 className="reveal mt-8 text-[clamp(2.6rem,6.6vw,5.25rem)] leading-[0.95] font-light tracking-[-0.05em] text-balance">
            Unlock the{" "}
            <span className="font-display tracking-[-0.02em]">future</span> of
            payments
          </h2>
          <p className="reveal mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-balance text-white/80 sm:text-[17px]">
            Get your API keys in two minutes. Test mode is free, forever.
          </p>

          {/* Posts to the sign-up route (not built yet). */}
          <form
            action="/sign-up"
            method="post"
            className="reveal mx-auto mt-9 flex w-full max-w-md items-center rounded-full bg-ink p-1 shadow-[0_24px_50px_-20px_rgb(20_8_70/0.9)]"
          >
            <label htmlFor="cta-email" className="sr-only">
              Work email
            </label>
            <Input
              id="cta-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="h-12 flex-1 rounded-full border-0 bg-white px-5 text-[15px] shadow-none focus-visible:ring-4 focus-visible:ring-brand-300/70"
            />
            <Button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-transparent px-5 text-[14px] hover:bg-white/10 sm:px-7"
            >
              Get API keys
            </Button>
          </form>
        </div>

        <nav
          aria-label="Footer"
          className="relative mx-auto max-w-6xl px-6 sm:px-10"
        >
          {/* Columns spread edge to edge so the block balances under the centered CTA
              and lines up with the bottom bar; text stays left-aligned for scanning. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/15 py-12 sm:flex sm:justify-between">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-white/60">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-[14px] text-white/85 transition-colors hover:text-white"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 border-t border-white/15 px-6 py-8 sm:flex-row sm:justify-between sm:px-10">
          <p className="text-[13px] text-white/75 sm:w-56">
            © {new Date().getFullYear()} VRS Pay. All rights reserved.
          </p>
          <ul className="flex items-center gap-2.5">
            {SOCIALS.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-11 place-items-center rounded-full text-white ring-1 ring-white/30 transition-colors ring-inset hover:bg-white/12"
                >
                  {s.icon}
                </a>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-[13px] text-white/75 sm:w-56 sm:justify-end">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-300" />
            All systems normal
          </p>
        </div>
      </div>
    </footer>
  );
}
