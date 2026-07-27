"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { magnetic, revealUp, useGSAP } from "@/components/marketing/scroll";
import SpecularButton from "@/components/SpecularButton";

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
          <div ref={magnetRef}>
            <Link href="/signup">
              <SpecularButton
                size="md"
                radius={9999}
                tint="#ffffff"
                tintOpacity={0.95}
                baseColor="#ffffff"
                lineColor="#ffffff"
                textColor="#000000"
                className="group"
              >
                <span className="flex items-center gap-2 font-semibold">
                  Start for free
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </SpecularButton>
            </Link>
          </div>
          <Link href="/contact/sales">
            <SpecularButton
              size="md"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#333333"
              lineColor="#ffffff"
              textColor="#ffffff"
            >
              <span className="font-medium">Talk to sales</span>
            </SpecularButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
