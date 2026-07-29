"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useHeroAnimations } from "@/components/marketing/hero-animations";
import SpecularButton from "@/components/SpecularButton";
import { Badge } from "@/components/ui/badge";

const HEADLINE_WORDS = ["Build", "Beyond", "Limits"];
const SUBTITLE =
  "We craft next-generation software, immersive interfaces, and scalable platforms that transform ambitious ideas into digital reality.";

/**
 * Hero text content with GSAP-powered staggered entrance animations.
 * Centered layout inspired by fundamental.bg.
 */
export function HeroContent() {
  const { containerRef, eyebrowRef, headlineRef, subtitleRef, ctaRef } =
    useHeroAnimations();

  return (
    <div
      ref={containerRef}
      className="relative z-20 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center min-h-svh"
    >
      {/* Eyebrow badge */}
      <div ref={eyebrowRef} className="will-animate mb-8">
        <Badge
          variant="outline"
          className="border-foreground/10 bg-foreground/5 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-sm"
        >
          Software for the Next Universe
        </Badge>
      </div>

      {/* Massive gradient headline */}
      <h1
        ref={headlineRef}
        className="mb-8 font-clash text-[clamp(3rem,10vw,8.5rem)] font-bold leading-[0.9] tracking-tight"
      >
        {HEADLINE_WORDS.map((word) => (
          <span
            key={word}
            className="hero-word will-animate inline-block mr-[0.25em] last:mr-0"
          >
            <span className="hero-gradient-text">{word}</span>
          </span>
        ))}
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="will-animate mb-12 max-w-xl font-acari text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        {SUBTITLE}
      </p>

      {/* CTAs */}
      <div
        ref={ctaRef}
        className="will-animate flex flex-col gap-4 sm:flex-row sm:gap-5"
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
          >
            <span className="flex items-center gap-2 font-semibold">
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
            baseColor="#333333"
            lineColor="#ffffff"
            textColor="currentColor"
          >
            <span className="font-medium">Talk to sales</span>
          </SpecularButton>
        </Link>
      </div>
    </div>
  );
}
