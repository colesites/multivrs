"use client";

import { ArrowUpRight, ChevronDown, Copy } from "lucide-react";
import Link from "next/link";
import { MultivrsMark } from "@/components/brand/Logo";
import { FooterParticleBrand } from "@/components/brand/FooterParticleBrand";
import type { NavColumn } from "@/components/nav/navigation";
import SpecularButton from "@/components/SpecularButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  FOOTER_GROUPS_PRIMARY,
  FOOTER_GROUPS_SECONDARY,
} from "@/lib/marketing/footer";

/**
 * Site footer, modeled on Vercel's: a split "for humans / for agents" call to
 * action, a 6-column × 2-row link grid, and a bottom bar with the brand mark,
 * system status, and an appearance indicator.
 *
 * Server component — pure markup, no client interactivity needed.
 */
export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-border bg-background">
      <div className="marketing-container py-16 lg:py-20">
        {/* Split CTA */}
        <div className="grid gap-12 border-b border-border pb-16 md:grid-cols-2">
          <div>
            <p className="max-w-sm font-acari text-sm leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">For humans.</span>{" "}
              Get started with Swift Rust and Multivrs in seconds.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup">
                <SpecularButton
                  size="sm"
                  radius={9999}
                  tint="#ffffff"
                  tintOpacity={0.95}
                  baseColor="#ffffff"
                  lineColor="#ffffff"
                  textColor="#000000"
                >
                  <span className="font-semibold">Deploy an app</span>
                </SpecularButton>
              </Link>
              <Link href="/docs">
                <SpecularButton
                  size="sm"
                  radius={9999}
                  tint="#ffffff"
                  tintOpacity={0.05}
                  baseColor="#333333"
                  lineColor="#ffffff"
                  textColor="currentColor"
                >
                  <span className="font-medium">View templates</span>
                </SpecularButton>
              </Link>
            </div>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="max-w-sm font-acari text-sm leading-relaxed text-muted-foreground md:ml-auto">
              <span className="font-semibold text-foreground">For agents.</span>{" "}
              Tools to connect your agents to Multivrs infrastructure.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-border bg-foreground/[0.02] py-2 pr-3 pl-2.5 font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-foreground/[0.04] px-2 py-1 text-foreground/70">
                Plugin
                <ChevronDown className="size-3" />
              </span>
              <span className="text-foreground/30">|</span>
              <code className="text-foreground/70">$ npx multivrs add</code>
              <Copy className="size-3.5 text-foreground/40" />
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

        {/* Interactive White Particle Logo & Brand Text */}
        <div className="my-10 sm:my-16">
          <FooterParticleBrand />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[0.7rem] text-muted-foreground">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                aria-label="Multivrs home"
                className="w-fit text-foreground transition-opacity hover:opacity-80"
              >
                <MultivrsMark className="size-5" />
              </Link>
              <span suppressHydrationWarning>© MULTIVRS 2026</span>
            </div>

            <div className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2 tracking-wider text-[#A855F7] uppercase">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#A855F7]/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-[#A855F7]" />
                </span>
                All systems normal
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ group }: { group: NavColumn }) {
  return (
    <div>
      <p className="mb-4 font-mono text-[0.7rem] font-medium tracking-widest text-muted-foreground uppercase">
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
              className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.title}
              {link.external && (
                <ArrowUpRight className="size-3 text-foreground/30 transition-colors group-hover:text-foreground" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
