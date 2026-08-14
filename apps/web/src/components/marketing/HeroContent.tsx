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
      className="marketing-container relative z-20 flex min-h-svh w-full flex-col justify-between pt-20 pb-16 sm:pt-24 sm:pb-20 lg:grid lg:grid-cols-3 lg:items-center lg:gap-8 lg:py-0"
    >
      {/* TOP HALF ON MOBILE (order-1) / CENTER ON DESKTOP (lg:order-2) */}
      <div
        ref={centerColRef}
        className="order-1 relative flex flex-1 w-full items-center justify-center min-h-[340px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-0 lg:h-[480px] lg:order-2"
      >
        {/* Central purple glow */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="size-72 sm:size-96 lg:size-96 rounded-full bg-[#A855F7]/25 blur-3xl" />
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
          className="h-full w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[440px]"
        />
      </div>

      {/* BOTTOM SECTION ON MOBILE: HEADLINE (order-2) / LEFT ON DESKTOP (lg:order-1) */}
      <div
        ref={leftColRef}
        className="order-2 mt-auto flex w-full flex-col items-center text-center lg:order-1 lg:mt-0 lg:items-start lg:text-left"
      >
        <h1 className="mb-2 lg:mb-8 font-clash">
          <FoldText
            text={"Build\nBeyond Limits"}
            splitBy="char"
            hinge="top"
            trigger="mount"
            duration={0.75}
            stagger={0.03}
            creaseShading={0.4}
            fontSize="clamp(3.6rem, 6.2vw, 6.2rem)"
            fontWeight={700}
            color="#ffffff"
            className="font-clash leading-[1.08] lg:leading-[1.05] tracking-tight select-none"
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

      {/* WORD FLIP: Directly under headline on Mobile (order-3) / Right column on Desktop (lg:order-3) */}
      <div
        ref={rightColRef}
        className="order-3 mt-2 flex w-full flex-col items-center text-center lg:order-3 lg:mt-0 lg:items-start lg:text-left lg:pl-6 xl:pl-8"
      >
        <div className="hero-feature-item font-mono text-xs sm:text-sm lg:font-sans lg:text-xl font-normal text-zinc-400 lg:text-white tracking-tight leading-normal select-none">
          <WordFlip words={HIGHLIGHTS} duration={2600} />
        </div>
      </div>

      {/* MOBILE CTAs: Directly under WordFlip on Mobile (order-4, hidden on desktop) */}
      <div
        ref={ctaRef}
        className="order-4 mt-6 sm:mt-8 flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 lg:hidden"
      >
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

      {/* Reserved bottom spacing on mobile for future logo cloud */}
      <div className="order-5 h-8 sm:h-12 w-full lg:hidden" aria-hidden="true" />
    </div>
  );
}
