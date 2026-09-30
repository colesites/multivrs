"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Developers", href: "#developers" },
  { label: "Platform", href: "#platform" },
  { label: "Customers", href: "#customers" },
  { label: "Docs", href: "/docs" },
] as const;

/** Always shown this close to the top of the page, in px. */
const REVEAL_ABOVE = 96;
/** Scroll moves smaller than this don't flip hide/show (no jitter). */
const JITTER = 8;
/** The hero's card row reaching this far from the top turns on the pill. */
const FLOAT_AT = 96;

/**
 * Headroom state for the fixed header:
 *   floating — the hero's card row ([data-hero-end]) has reached the header,
 *              so the bg-less header morphs into the compact glass pill.
 *              White nav text never sits on the white cards.
 *   hidden   — scrolling down hides it; any scroll up brings it back.
 * rAF-throttled and passive; setState bails out when nothing changed.
 */
function useHeadroom() {
  const [floating, setFloating] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const heroEnd = document.querySelector("[data-hero-end]");
      setFloating(
        heroEnd ? heroEnd.getBoundingClientRect().top < FLOAT_AT : y > 16,
      );
      if (y <= REVEAL_ABOVE) {
        setHidden(false);
        last = y;
        return;
      }
      const delta = y - last;
      if (Math.abs(delta) < JITTER) return;
      setHidden(delta > 0);
      last = y;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { floating, hidden };
}

/**
 * Fixed "headroom" header — a client island (the only React shipped to the
 * browser). State lands on data-floating / data-hidden and everything visual
 * is CSS: group-data variants here, the slide in .site-header (globals.css).
 * At the top of the page it lines up exactly with the hero frame; the hero
 * reserves its height with a spacer.
 *
 * The mobile menu is a native popover (light-dismiss, Esc, focus handling).
 */
export function SiteNav() {
  const { floating, hidden } = useHeadroom();

  return (
    <header
      id="site-header"
      data-floating={floating ? "true" : "false"}
      data-hidden={hidden ? "true" : "false"}
      className="site-header group/nav fixed inset-x-0 top-0 z-50 px-2 pt-2 sm:px-3 sm:pt-3"
    >
      <div className="relative mx-auto flex max-w-full items-center justify-between gap-4 rounded-full px-4 py-4 transition-[max-width,padding,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-7 sm:py-5 group-data-[floating=true]/nav:max-w-[21rem] group-data-[floating=true]/nav:bg-white/50 group-data-[floating=true]/nav:px-2 group-data-[floating=true]/nav:py-1.5 group-data-[floating=true]/nav:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_0_0_1px_rgb(11_11_18/0.06),0_12px_40px_-14px_rgb(11_11_18/0.25)] group-data-[floating=true]/nav:backdrop-blur-2xl group-data-[floating=true]/nav:backdrop-saturate-[1.8] sm:group-data-[floating=true]/nav:max-w-[26rem] sm:group-data-[floating=true]/nav:px-2 sm:group-data-[floating=true]/nav:py-1.5 lg:group-data-[floating=true]/nav:max-w-[58rem]">
        <a
          href="/"
          aria-label="VRS Pay home"
          className="rounded-lg [--logo-glyph:#6936f5] [--logo-text:#fff] [--logo-tile:#fff] group-data-[floating=true]/nav:[--logo-glyph:#fff] group-data-[floating=true]/nav:[--logo-text:#0b0b12] group-data-[floating=true]/nav:[--logo-tile:#6936f5]"
        >
          <Logo tone="light" />
        </a>

        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 lg:block"
        >
          <ul className="flex items-center gap-0.5 rounded-full bg-white/12 p-1 ring-1 ring-white/30 ring-inset backdrop-blur-md transition-colors duration-300 group-data-[floating=true]/nav:bg-transparent group-data-[floating=true]/nav:ring-transparent group-data-[floating=true]/nav:backdrop-blur-none">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block rounded-full px-4 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white group-data-[floating=true]/nav:text-ink group-data-[floating=true]/nav:hover:bg-ink/5"
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
            className="hidden rounded-full px-3.5 py-2 text-[13px] font-medium text-white/90 transition-colors hover:text-white sm:block group-data-[floating=true]/nav:text-ink group-data-[floating=true]/nav:hover:text-ink/70"
          >
            Sign in
          </a>
          <a
            href="/sign-up"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white py-2 pr-2 pl-4 text-[13px] font-medium text-ink shadow-[0_6px_20px_-8px_rgb(11_11_18/0.45)] transition hover:bg-white/90 group-data-[floating=true]/nav:bg-ink group-data-[floating=true]/nav:text-white group-data-[floating=true]/nav:shadow-none group-data-[floating=true]/nav:hover:bg-ink/85"
          >
            Get started
            <span className="grid size-5 place-items-center rounded-full bg-ink text-white transition-[rotate,background-color,color] group-hover:rotate-45 group-data-[floating=true]/nav:bg-white group-data-[floating=true]/nav:text-ink">
              <ArrowUpRight className="size-3" strokeWidth={2.5} />
            </span>
          </a>
          <button
            type="button"
            popoverTarget="mobile-nav"
            aria-label="Open menu"
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 ring-inset backdrop-blur-md transition-colors lg:hidden group-data-[floating=true]/nav:bg-ink/5 group-data-[floating=true]/nav:text-ink group-data-[floating=true]/nav:ring-black/10 group-data-[floating=true]/nav:backdrop-blur-none"
          >
            <Menu className="size-4" />
          </button>
        </div>
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
