"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHeroAnimations } from "@/components/hero/hero-animations";
import { ArrowRight, Play } from "lucide-react";

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
          className="border-white/10 bg-white/3 px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-white/60 uppercase backdrop-blur-sm"
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
          <span key={word} className="hero-word will-animate inline-block mr-[0.25em] last:mr-0">
            <span className="hero-gradient-text">{word}</span>
          </span>
        ))}
      </h1>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        className="will-animate mb-12 max-w-xl font-acari text-base leading-relaxed text-white/50 sm:text-lg"
      >
        {SUBTITLE}
      </p>

      {/* CTAs */}
      <div ref={ctaRef} className="will-animate flex flex-col gap-4 sm:flex-row sm:gap-5">
        <Button
          size="lg"
          className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-semibold text-background transition-all hover:shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Start a Project
          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="rounded-full border-white/10 bg-white/3 px-8 py-3 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/6 hover:text-white"
        >
          <Play className="mr-2 size-3.5 fill-current" />
          Explore Our Work
        </Button>
      </div>
    </div>
  );
}
