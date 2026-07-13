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

type CharRevealOptions = {
  trigger?: TriggerEl;
  start?: string;
  end?: string;
  stagger?: number;
  duration?: number;
  /** When set, the reveal is tied to scroll position between start and end. */
  scrub?: boolean | number;
};

/**
 * Per-character assemble for the giant wordmark. With `scrub`, characters lock
 * to scroll position for a cinematic build. Reduced motion → simple fade.
 */
export function revealChars(
  el: HTMLElement | null,
  options: CharRevealOptions = {},
) {
  if (!el) return;
  const {
    trigger,
    start = "top 78%",
    end = "top 32%",
    stagger = 0.04,
    duration = 1.1,
    scrub = false,
  } = options;
  const t = trigger ?? el;

  if (prefersReducedMotion()) {
    return gsap.from(el, {
      autoAlpha: 0,
      duration: 0.6,
      ease: "power1.out",
      scrollTrigger: { trigger: t, start, once: true },
    });
  }

  return SplitText.create(el, {
    type: "chars",
    autoSplit: true,
    onSplit: (self) =>
      gsap.from(self.chars, {
        yPercent: 120,
        autoAlpha: 0,
        rotateX: -40,
        transformOrigin: "50% 100%",
        stagger,
        duration: scrub ? undefined : duration,
        ease: scrub ? "none" : "power4.out",
        scrollTrigger: scrub
          ? { trigger: t, start, end, scrub: scrub === true ? 1 : scrub }
          : { trigger: t, start, once: true },
      }),
  });
}

/**
 * Subtle vertical scroll parallax. `yPercent` is the drift across the viewport
 * pass. No-op under reduced motion.
 */
export function parallax(
  el: Element | null,
  options: { yPercent?: number; trigger?: TriggerEl } = {},
) {
  if (!el || prefersReducedMotion()) return;
  const { yPercent = -10, trigger } = options;
  return gsap.to(el, {
    yPercent,
    ease: "none",
    scrollTrigger: {
      trigger: trigger ?? el,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
}

/**
 * Stroke-on for SVG line art via DrawSVG. Reduced motion → fade the container.
 */
export function drawOn(
  strokes: NodeListOf<SVGElement> | SVGElement[],
  options: {
    trigger?: TriggerEl;
    start?: string;
    stagger?: number;
    duration?: number;
    container?: Element | null;
  } = {},
) {
  const list = Array.from(strokes ?? []);
  if (!list.length) return;
  const {
    trigger,
    start = "top 75%",
    stagger = 0.06,
    duration = 1.1,
    container,
  } = options;

  if (prefersReducedMotion()) {
    if (container) {
      return gsap.from(container, {
        autoAlpha: 0,
        duration: 0.5,
        scrollTrigger: { trigger: trigger ?? container, start, once: true },
      });
    }
    return;
  }

  return gsap.from(list, {
    drawSVG: "0%",
    duration,
    ease: "power2.inOut",
    stagger,
    scrollTrigger: { trigger, start, once: true },
  });
}

/**
 * Pointer-driven 3D tilt with optional parallax shift on an inner element.
 * Returns a cleanup function. No-op (cleanup is a no-op) under reduced motion.
 */
export function tilt(
  card: HTMLElement | null,
  inner: HTMLElement | null,
  options: { max?: number; shift?: number } = {},
): () => void {
  if (!card || prefersReducedMotion()) return () => {};
  const { max = 7, shift = 20 } = options;

  gsap.set(card, { transformPerspective: 800, transformStyle: "preserve-3d" });
  const rotX = gsap.quickTo(card, "rotationX", {
    duration: 0.5,
    ease: "power3",
  });
  const rotY = gsap.quickTo(card, "rotationY", {
    duration: 0.5,
    ease: "power3",
  });
  const ix = inner
    ? gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3" })
    : null;
  const iy = inner
    ? gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3" })
    : null;

  const onMove = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY(px * max);
    rotX(-py * max);
    ix?.(px * -shift);
    iy?.(py * -shift);
  };
  const onLeave = () => {
    rotX(0);
    rotY(0);
    ix?.(0);
    iy?.(0);
  };

  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);
  return () => {
    card.removeEventListener("pointermove", onMove);
    card.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * Magnetic pull toward the cursor. Returns a cleanup function.
 * No-op under reduced motion.
 */
export function magnetic(el: HTMLElement | null, strength = 0.4): () => void {
  if (!el || prefersReducedMotion()) return () => {};
  const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
  const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

  const onMove = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    mx((e.clientX - (r.left + r.width / 2)) * strength);
    my((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    mx(0);
    my(0);
  };

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * Ambient infinite float for idle life on a decorative element.
 * No-op under reduced motion.
 */
export function floaty(
  el: Element | null,
  options: { y?: number; duration?: number; delay?: number } = {},
) {
  if (!el || prefersReducedMotion()) return;
  const { y = 10, duration = 4, delay = 0 } = options;
  return gsap.to(el, {
    y,
    duration,
    delay,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}
