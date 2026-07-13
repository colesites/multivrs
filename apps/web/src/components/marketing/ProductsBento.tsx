"use client";

import { useRef } from "react";
import { ProductCard } from "@/components/marketing/ProductCard";
import { revealLines, revealUp, useGSAP } from "@/components/marketing/scroll";
import { PRODUCTS } from "@/lib/marketing/products";

export function ProductsBento() {
  const root = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
      revealUp(gridRef.current?.querySelectorAll<HTMLElement>("[data-card]"), {
        trigger: gridRef.current,
        start: "top 80%",
        y: 40,
        stagger: 0.1,
        duration: 0.9,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="products"
      className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"
    >
      <div ref={headerRef} className="max-w-2xl">
        <p
          data-reveal
          className="mb-5 font-mono text-xs tracking-[0.25em] text-white/40 uppercase"
        >
          The Ecosystem
        </p>
        <h2
          ref={headingRef}
          className="font-clash text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white"
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

      <div
        ref={gridRef}
        className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6 md:auto-rows-[minmax(200px,auto)] lg:mt-20 lg:gap-5"
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}
