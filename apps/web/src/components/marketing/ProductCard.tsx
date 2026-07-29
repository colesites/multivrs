"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { PRODUCT_ART } from "@/components/marketing/art/product-art-map";
import { floaty, tilt, useGSAP } from "@/components/marketing/scroll";
import type { Product } from "@/lib/marketing/products";
import { cn } from "@/lib/utils";

/**
 * A single bento card. The card itself owns a pointer-driven 3D tilt with a
 * parallax shift on the art for depth; a stretched `Link` overlay keeps the
 * whole card clickable while staying accessible.
 */
export function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const Art = PRODUCT_ART[product.art];

  useGSAP(
    () => {
      // 3D tilt + parallax shift on the art wrapper (artRef), plus a gentle
      // ambient float on a separate inner element so the two never fight over
      // the same transform.
      const cleanup = tilt(cardRef.current, artRef.current, {
        max: 7,
        shift: 20,
      });
      floaty(floatRef.current, {
        y: 6,
        duration: 5 + Math.random() * 2,
        delay: Math.random() * 1.5,
      });
      return cleanup;
    },
    { scope: cardRef },
  );

  const linkProps = product.external
    ? { href: product.href, target: "_blank", rel: "noopener noreferrer" }
    : { href: product.href };

  return (
    <div
      ref={cardRef}
      data-card
      className={cn(
        "bento-card card-grain group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] backdrop-blur-2xl p-6 transition-[border-color,box-shadow] duration-500 sm:p-7",
        product.span,
      )}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover/bento:opacity-100"
        style={{
          background:
            "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.15), transparent 40%)",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/bento:opacity-100 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.4), transparent 40%)",
          zIndex: 1,
        }}
      />

      {/* Stretched, accessible link over the whole card */}
      <Link
        {...linkProps}
        aria-label={`${product.name} - ${product.external ? "visit site" : "learn more"}`}
        className="absolute inset-0 z-20 rounded-2xl outline-hidden focus-visible:ring-2 focus-visible:ring-[#2563eb]/60"
      />

      {/* Art */}
      <div className="relative min-h-[150px] flex-1">
        <div
          ref={artRef}
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center p-1"
        >
          <div
            ref={floatRef}
            className="flex h-full w-full items-center justify-center"
          >
            <Art className="h-full w-full opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10">
        <p className="mb-2 font-mono text-[0.65rem] tracking-[0.2em] text-white/40 uppercase">
          {product.tag}
        </p>
        <h3 className="font-clash text-2xl font-semibold tracking-tight text-white">
          {product.name}
        </h3>
        <p className="mt-2.5 max-w-sm font-acari text-sm leading-relaxed text-white/50">
          {product.blurb}
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors duration-300 group-hover:text-white">
          {product.external ? "Visit site" : "Learn more"}
          {product.external ? (
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          ) : (
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </span>
      </div>
    </div>
  );
}
