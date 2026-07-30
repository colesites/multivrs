"use client";

/**
 * Shared GSAP scroll-animation toolkit for the marketing site.
 *
 * One module owns plugin registration so every section imports `gsap`,
 * `useGSAP`, ScrollTrigger, SplitText and DrawSVG from a single place (GSAP is
 * a singleton — registering once here is enough for the whole app).
 *
 * Reduced-motion policy: we never go fully static. Large, vestibular-triggering
 * motion (parallax, 3D tilt, scrubbed scenes, ambient loops) is dropped, but
 * elements still get a gentle opacity fade so the page never feels dead. Helpers
 * read `prefersReducedMotion()` internally so callers stay simple.
 */

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin);

export { DrawSVGPlugin, gsap, ScrollTrigger, SplitText, useGSAP };

/** True when the OS-level "reduce motion" setting is on (SSR-safe). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type TriggerEl = Element | null | undefined;
type Targets = gsap.TweenTarget;

type RevealOptions = {
  trigger?: TriggerEl;
  start?: string;
  y?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
};

/**
 * Staggered fade-up reveal for a group of elements as they enter the viewport.
 * Reduced motion → opacity-only fade (no travel).
 */
export function revealUp(
  targets: Targets | null | undefined,
  options: RevealOptions = {},
) {
  if (!targets) return;
  const {
    trigger,
    start = "top 82%",
    y = 32,
    stagger = 0.09,
    duration = 0.9,
    once = true,
  } = options;
  const reduce = prefersReducedMotion();

  return gsap.from(targets, {
    autoAlpha: 0,
    y: reduce ? 0 : y,
    duration: reduce ? 0.5 : duration,
    ease: reduce ? "power1.out" : "power3.out",
    stagger: reduce ? Math.min(stagger, 0.04) : stagger,
    scrollTrigger: { trigger: trigger ?? undefined, start, once },
  });
}

type LineRevealOptions = {
  trigger?: TriggerEl;
  start?: string;
  stagger?: number;
  duration?: number;
};

/**
 * Apple-style masked line reveal. SplitText wraps each line in an
 * overflow-hidden mask and the lines slide up from beneath it. `autoSplit`
 * re-splits after web fonts load so line breaks stay correct.
 * Reduced motion → a simple fade of the whole element.
 */
export function revealLines(
  el: HTMLElement | null,
  options: LineRevealOptions = {},
) {
  if (!el) return;
  const { trigger, start = "top 85%", stagger = 0.12, duration = 1 } = options;
  const t = trigger ?? el;

  if (prefersReducedMotion()) {
    return gsap.from(el, {
      autoAlpha: 0,
      duration: 0.5,
      ease: "power1.out",
      scrollTrigger: { trigger: t, start, once: true },
    });
  }

  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration,
        ease: "power4.out",
        stagger,
        scrollTrigger: { trigger: t, start, once: true },
      }),
  });
}
