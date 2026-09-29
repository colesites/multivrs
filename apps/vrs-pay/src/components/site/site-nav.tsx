import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "./logo";

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Developers", href: "#developers" },
  { label: "Platform", href: "#platform" },
  { label: "Customers", href: "#customers" },
  { label: "Docs", href: "/docs" },
] as const;

/**
 * Sits on top of the hero photograph. The mobile menu is a native popover
 * (light-dismiss, Esc, focus handling for free) — no client JS bundle.
 */
export function SiteNav() {
  return (
    <header className="relative z-30 flex items-center justify-between gap-4 px-4 py-4 sm:px-7 sm:py-5">
      <a href="/" aria-label="VRS Pay home" className="rounded-lg">
        <Logo tone="light" />
      </a>

      <nav
        aria-label="Primary"
        className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
      >
        <ul className="flex items-center gap-0.5 rounded-full bg-white/12 p-1 ring-1 ring-white/30 ring-inset backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block rounded-full px-4 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <a
          href="/sign-in"
          className="hidden rounded-full px-3.5 py-2 text-[13px] font-medium text-white/90 transition-colors hover:text-white sm:block"
        >
          Sign in
        </a>
        <a
          href="/sign-up"
          className="group inline-flex items-center gap-1.5 rounded-full bg-white py-2 pr-2 pl-4 text-[13px] font-medium text-ink shadow-[0_6px_20px_-8px_rgb(11_11_18/0.45)] transition hover:bg-white/90"
        >
          Get started
          <span className="grid size-5 place-items-center rounded-full bg-ink text-white transition-transform group-hover:rotate-45">
            <ArrowUpRight className="size-3" strokeWidth={2.5} />
          </span>
        </a>
        <button
          type="button"
          popoverTarget="mobile-nav"
          aria-label="Open menu"
          className="grid size-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 ring-inset backdrop-blur-md lg:hidden"
        >
          <Menu className="size-4" />
        </button>
      </div>

      <div id="mobile-nav" popover="auto" className="mobile-nav lg:hidden">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            popoverTarget="mobile-nav"
            popoverTargetAction="hide"
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-full bg-wash text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <nav aria-label="Mobile" className="mt-6">
          <ul className="divide-y divide-line">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex items-center justify-between py-3.5 text-[17px] font-medium tracking-tight"
                >
                  {link.label}
                  <ArrowUpRight className="size-4 text-mute" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <a
            href="/sign-in"
            className="rounded-full bg-wash py-3 text-center text-sm font-medium text-ink"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="rounded-full bg-ink py-3 text-center text-sm font-medium text-white"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
