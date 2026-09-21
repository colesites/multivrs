"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import CursorGrid from "@/components/CursorGrid";
import SpecularButton from "@/components/SpecularButton";

export function EmailsCta() {
  return (
    <section className="relative w-full overflow-hidden border-t border-border bg-background py-28 text-foreground lg:py-40">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <CursorGrid
          cellSize={65}
          color="#A855F7"
          radius={160}
          falloff="smooth"
          holdTime={400}
          fadeDuration={700}
          lineWidth={1}
          maxOpacity={0.6}
          gridOpacity={0.06}
          className="pointer-events-auto"
        />
      </div>
      <div className="marketing-container relative z-10 flex flex-col items-center text-center">
        <h2 className="bg-gradient-to-b from-foreground via-foreground to-foreground/45 bg-clip-text font-clash text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.02] tracking-tight text-transparent">
          Email, reimagined.
          <br />
          Ready when you are.
        </h2>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          Connect a domain, create a mailbox, and send your first message in the
          time it takes to read this page.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
              <span className="flex items-center gap-2 text-sm font-semibold">
                Get started
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </SpecularButton>
          </Link>
          <Link href="/contact/sales">
            <SpecularButton
              size="md"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#1c1c1c"
              lineColor="#ffffff"
              textColor="currentColor"
            >
              <span className="text-sm font-medium">Talk to sales</span>
            </SpecularButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
