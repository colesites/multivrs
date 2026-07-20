"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { revealLines, revealUp, useGSAP, gsap, ScrollTrigger } from "@/components/marketing/scroll";
import { PRODUCTS, type Product } from "@/lib/marketing/products";
import { cn } from "@/lib/utils";

export function ProductsBento() {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;

      revealLines(headingRef.current, { start: "top 85%" });
      revealUp(
        headerRef.current?.querySelectorAll<HTMLElement>("[data-reveal]"),
        {
          trigger: headerRef.current,
          start: "top 82%",
          y: 24,
        },
      );

      // Horizontal 3D Scroll Gallery
      if (galleryRef.current && cardsRef.current) {
        const getScrollAmount = () => {
          const wrapperWidth = cardsRef.current?.offsetWidth || 0;
          const viewportWidth = window.innerWidth;
          // Ensure we only scroll enough to see the end of the cards
          return -(wrapperWidth - viewportWidth); 
        };

        const tween = gsap.to(cardsRef.current, {
          x: getScrollAmount,
          ease: "none",
        });

        // Pin the gallery section
        ScrollTrigger.create({
          trigger: galleryRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount() * -1}`,
          pin: true,
          scrub: 1,
          animation: tween,
          invalidateOnRefresh: true,
        });
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="products"
      className="relative mx-auto w-full max-w-none pt-28 lg:pt-40 overflow-hidden"
    >
      <div ref={headerRef} className="max-w-4xl mx-auto px-6 lg:px-10 mb-20">
        <p
          data-reveal
          className="mb-5 font-mono text-xs tracking-[0.25em] text-white/40 uppercase"
        >
          The Ecosystem
        </p>
        <h2
          ref={headingRef}
          className="font-clash text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[1.02] tracking-tight text-white"
        >
          A universe of products, built to work as one.
        </h2>
        <p
          data-reveal
          className="mt-6 max-w-xl font-acari text-base leading-relaxed text-white/50 sm:text-lg"
        >
          Each Multivrs product stands on its own, and together they form a
          single, seamless platform for building software.
        </p>
      </div>

      <div ref={galleryRef} className="h-screen w-full flex items-center overflow-hidden">
        <div 
          ref={cardsRef} 
          className="flex w-max h-full items-center pl-10 lg:pl-40 pr-[50vw] gap-10"
          style={{ perspective: "1000px" }}
        >
          {PRODUCTS.map((product) => (
            <div 
              key={product.name}
              className="flex-shrink-0 w-[85vw] max-w-[600px] aspect-[4/5] relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden p-10 flex flex-col justify-between group transition-colors hover:border-white/20"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Clean minimalist data block */}
              <div>
                <p className="mb-4 font-mono text-sm tracking-[0.2em] text-white/40 uppercase">
                  {product.tag}
                </p>
                <h3 className="font-clash text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
                  {product.name}
                </h3>
                <p className="max-w-md font-acari text-lg leading-relaxed text-white/60">
                  {product.blurb}
                </p>
              </div>

              {/* Minimalist Tech Ring representation instead of mouse planet */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full pointer-events-none opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full pointer-events-none opacity-50 group-hover:opacity-100 group-hover:-rotate-90 transition-all duration-1000 ease-out border-t-transparent" />

              <div className="mt-auto">
                <Link
                  href={product.href}
                  target={product.external ? "_blank" : undefined}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest"
                >
                  {product.external ? "Visit site" : "Learn more"}
                  {product.external ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
