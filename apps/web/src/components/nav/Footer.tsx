import {
  ArrowUpRight,
  ChevronDown,
  Copy,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { MultivrsMark } from "@/components/brand/Logo";
import type { NavColumn } from "@/components/nav/navigation";
import {
  FOOTER_GROUPS_PRIMARY,
  FOOTER_GROUPS_SECONDARY,
} from "@/lib/marketing/footer";
import Image from "next/image";

/**
 * Site footer, modeled on Vercel's: a split "for humans / for agents" call to
 * action, a 6-column × 2-row link grid, and a bottom bar with the brand mark,
 * system status, and an appearance indicator.
 *
 * Server component — pure markup, no client interactivity needed.
 */
export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-white/10 bg-[#030303]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
        {/* Split CTA */}
        <div className="grid gap-12 border-b border-white/10 pb-16 md:grid-cols-2">
          <div>
            <p className="max-w-sm font-acari text-sm leading-relaxed text-white/60">
              <span className="font-semibold text-white">For humans.</span> Get
              started with Swift Rust and Multivrs in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-background transition-colors hover:bg-white/90"
              >
                Deploy an app
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                View templates
              </Link>
            </div>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="max-w-sm font-acari text-sm leading-relaxed text-white/60 md:ml-auto">
              <span className="font-semibold text-white">For agents.</span>{" "}
              Tools to connect your agents to Multivrs infrastructure.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-white/12 bg-white/[0.02] py-2 pr-3 pl-2.5 font-mono text-xs text-white/55">
              <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-2 py-1 text-white/70">
                Plugin
                <ChevronDown className="size-3" />
              </span>
              <span className="text-white/30">|</span>
              <code className="text-white/70">$ npx multivrs add</code>
              <Copy className="size-3.5 text-white/40" />
            </div>
          </div>
        </div>

        {/* Link grid — two rows of six */}
        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {FOOTER_GROUPS_PRIMARY.map((group) => (
            <FooterColumn key={group.heading} group={group} />
          ))}
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {FOOTER_GROUPS_SECONDARY.map((group) => (
            <FooterColumn key={group.heading} group={group} />
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 flex flex-col gap-8 border-t border-white/10 pt-10">
          <Link
            href="/"
            aria-label="Multivrs home"
            className="w-fit text-white"
          >
            <MultivrsMark className="size-6" />
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] tracking-wider text-[#2563eb] uppercase">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#2563eb]/60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#2563eb]" />
              </span>
              All systems normal.
            </span>
            <AppearanceIndicator />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ group }: { group: NavColumn }) {
  return (
    <div>
      <p className="mb-4 font-mono text-[0.7rem] font-medium tracking-widest text-white/35 uppercase">
        {group.heading}
      </p>
      <ul className="space-y-3">
        {group.links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group inline-flex items-center gap-1 text-sm text-white/55 transition-colors hover:text-white"
            >
              {link.title}
              {link.external && (
                <ArrowUpRight className="size-3 text-white/30 transition-colors group-hover:text-white" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Visual appearance indicator matching the footer's bottom-right control.
 * Decorative for now — the marketing site is dark-only, so it's marked
 * aria-hidden rather than presenting a non-functional theme switch.
 */
function AppearanceIndicator() {
  return (
    <div
      aria-hidden="true"
      className="inline-flex items-center rounded-full border border-white/10 p-0.5"
    >
      <span className="grid size-7 place-items-center rounded-full text-white/35">
        <Monitor className="size-3.5" />
      </span>
      <span className="grid size-7 place-items-center rounded-full text-white/35">
        <Sun className="size-3.5" />
      </span>
      <span className="grid size-7 place-items-center rounded-full bg-white/10 text-white">
        <Moon className="size-3.5" />
      </span>
    </div>
  );
}
