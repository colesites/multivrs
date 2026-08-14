"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useHeroAnimations } from "@/components/marketing/hero-animations";
import SpecularButton from "@/components/SpecularButton";
import FoldText from "@/components/FoldText";
import { WordFlip } from "@/components/WordFlip";

const ParticleLogo = dynamic(() => import("@/components/ParticleLogo"), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[320px]" />,
});

const HIGHLIGHTS = [
  "For shipping apps",
  "To buy custom domains",
  "With transactional mailboxes",
];

/**
 * Hero content:
 * - On Mobile (< lg):
 *   Upper half: Big, bold Particle M Logo (top zone)
 *   Lower half: Headline ("Build Beyond Limits"), WordFlip rotating text, and CTA buttons
 *   Bottom: Reserved spacing for logo bar
 *
 * - On Desktop (lg):
 *   Horizontal 3-column layout:
 *   Left: Headline + CTA buttons
 *   Center: Particle Logo
 *   Right: Rotating WordFlip value proposition
 */
export function HeroContent() {
  const { containerRef, leftColRef, centerColRef, rightColRef, ctaRef } =
    useHeroAnimations();

  return (
    <div
      ref={containerRef}
      className="marketing-container relative z-20 flex min-h-svh w-full flex-col justify-between items-center pt-16 pb-10 sm:pt-20 sm:pb-14 lg:grid lg:grid-cols-3 lg:items-center lg:gap-8 lg:py-0"
    >
      {/* 1. TOP ON MOBILE (order-1) / CENTER ON DESKTOP (lg:order-2) */}
      <div
        ref={centerColRef}
        className="order-1 relative flex w-full items-center justify-center h-[260px] sm:h-[320px] lg:h-[480px] lg:order-2"
      >
        {/* Central purple glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="size-60 sm:size-80 lg:size-96 rounded-full bg-[#A855F7]/25 blur-3xl" />
        </div>

        <ParticleLogo
          particleSize={2.8}
          density={3.2}
          scaleRatio={0.92}
          color="#ffffff"
          highlightColor="#A855F7"
          scatter={150}
          gatherDuration={1800}
          stagger={360}
          pointerRepel={50}
          repelRadius={130}
          idleDrift={0.8}
          trigger="mount"
          glow={true}
          className="h-full w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[440px]"
        />
      </div>

      {/* 2. HEADLINE: Center on mobile (order-2) / Left on desktop (lg:order-1) */}
      <div
        ref={leftColRef}
        className="order-2 my-auto flex w-full max-w-full flex-col items-center text-center px-2 sm:px-0 lg:order-1 lg:my-0 lg:max-w-[360px] xl:max-w-[420px] lg:items-start lg:text-left"
      >
        <h1 className="mb-2 lg:mb-8 font-clash max-w-full">
          <FoldText
            text={"Build\nBeyond Limits"}
            splitBy="char"
            hinge="top"
            trigger="mount"
            duration={0.75}
            stagger={0.03}
            creaseShading={0.4}
            fontSize="clamp(2.1rem, 3.6vw, 3.8rem)"
            fontWeight={700}
            color="#ffffff"
            className="font-clash leading-[1.02] lg:leading-[1.04] tracking-tight select-none max-w-full inline-block"
          />
        </h1>

        {/* Desktop-only CTAs inside left column */}
        <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-4">
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
              forceTheme="dark"
            >
              <span className="flex items-center gap-2 font-semibold text-sm">
                Start for free
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
              baseColor="#18181b"
              lineColor="#ffffff"
              textColor="currentColor"
              forceTheme="dark"
            >
              <span className="font-medium text-sm">Talk to sales</span>
            </SpecularButton>
          </Link>
        </div>
      </div>

      {/* 3. SUBTITLE / VALUE PROP: Word Flip on Mobile ONLY (order-3), Clean text lines on Desktop (lg:order-3) */}
      <div
        ref={rightColRef}
        className="order-3 mt-1 flex w-full flex-col items-center text-center lg:order-3 lg:mt-0 lg:items-start lg:text-left lg:pl-6 xl:pl-8"
      >
        {/* Mobile-only WordFlip */}
        <div className="block lg:hidden hero-feature-item font-mono text-xs sm:text-sm font-normal text-white select-none">
          <WordFlip words={HIGHLIGHTS} duration={2600} />
        </div>

        {/* Desktop clean text (no bullets) */}
        <div className="hidden lg:flex lg:flex-col space-y-3 font-sans text-base xl:text-lg text-white font-normal select-none">
          {HIGHLIGHTS.map((item) => (
            <div key={item} className="text-white">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 4. MOBILE CTAs: Full-width stacked buttons under WordFlip (order-4, hidden on desktop) */}
      <div
        ref={ctaRef}
        className="order-4 mt-6 flex w-full max-w-xs flex-col items-center justify-center gap-3 lg:hidden"
      >
        <Link href="/signup" className="w-full">
          <SpecularButton
            size="md"
            radius={9999}
            tint="#ffffff"
            tintOpacity={0.95}
            baseColor="#ffffff"
            lineColor="#ffffff"
            textColor="#000000"
            className="group w-full py-3.5"
            forceTheme="dark"
          >
            <span className="flex items-center justify-center gap-2 font-semibold text-sm">
              Start for free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </SpecularButton>
        </Link>

        <Link href="/contact/sales" className="w-full">
          <SpecularButton
            size="md"
            radius={9999}
            tint="#ffffff"
            tintOpacity={0.05}
            baseColor="#18181b"
            lineColor="#ffffff"
            textColor="currentColor"
            className="w-full py-3.5"
            forceTheme="dark"
          >
            <span className="flex items-center justify-center font-medium text-sm">Talk to sales</span>
          </SpecularButton>
        </Link>
      </div>

      {/* 5. Reserved bottom spacing / logo placeholder on mobile */}
      <div className="order-5 h-10 sm:h-14 w-full lg:hidden" aria-hidden="true" />
    </div>
  );
}
