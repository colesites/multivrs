"use client";

import { useEffect } from "react";
import { onIdle } from "@/lib/browser/idle";

async function createSmoothScroll(): Promise<() => void> {
  const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] =
    await Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
  });
  lenis.on("scroll", ScrollTrigger.update);
  const onTick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(onTick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(onTick);
    lenis.destroy();
  };
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let teardown: (() => void) | undefined;
    const cancelIdle = onIdle(() => {
      void createSmoothScroll().then((cleanup) => {
        if (disposed) cleanup();
        else teardown = cleanup;
      });
    }, 1200);
    return () => {
      disposed = true;
      cancelIdle();
      teardown?.();
    };
  }, []);

  return null;
}
