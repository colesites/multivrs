"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import {
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
} from "@/components/marketing/scroll";

/**
 * Buttery momentum scrolling (Lenis) wired into GSAP's ticker so ScrollTrigger
 * stays perfectly in sync — the foundation of the "award-winning" scroll feel.
 *
 * Under reduced motion we bail out and leave native scrolling untouched.
 * Renders nothing; mount it once near the top of the marketing tree.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // easeOutExpo — long, premium glide
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
