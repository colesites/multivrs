"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { magnetic, revealUp, useGSAP } from "@/components/marketing/scroll";
import { Button } from "@/components/ui/button";

/**
 * Closing CTA band. Reveals on scroll and gives the primary button a subtle
 * magnetic pull toward the cursor (skipped under reduced motion).
 */
export function CtaSection() {
  const root = useRef<HTMLElement>(null);
  const magnetRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;

      revealUp(root.current.querySelectorAll<HTMLElement>("[data-reveal]"), {
        trigger: root.current,
        start: "top 80%",
        stagger: 0.1,
      });

      return magnetic(magnetRef.current, 0.4);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative mx-auto max-w-7xl px-6 lg:px-10">
      <div className="flex flex-col items-center border-t border-white/10 py-28 text-center lg:py-36">
        <p
          data-reveal
          className="mb-6 font-mono text-xs tracking-[0.25em] text-white/40 uppercase"
        >
          Get started
        </p>
        <h2
          data-reveal
          className="max-w-3xl font-clash text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight text-white"
        >
          Start building with Multivrs.
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-md font-acari text-base leading-relaxed text-white/50 sm:text-lg"
        >
          Ship your first project in minutes. No credit card, no setup, just
          deploy and go.
        </p>
        <div
          data-reveal
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <div ref={magnetRef} className="will-change-transform">
            <Button
              nativeButton={false}
              render={<Link href="/signup" />}
              className="group h-11 rounded-full bg-white px-6 text-sm font-semibold text-background transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.35)] active:scale-[0.98]"
            >
              Start for free
              <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/contact/sales" />}
            className="h-11 rounded-full border border-white/15 bg-transparent px-6 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/5"
          >
            Talk to sales
          </Button>
        </div>
      </div>
    </section>
  );
}
