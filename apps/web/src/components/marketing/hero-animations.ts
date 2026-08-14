"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

/**
 * GSAP timeline animation for the horizontal 3-column hero layout.
 * Left headline & CTAs | Center particle logo | Right feature highlights
 */
export function useHeroAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const centerColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px)",
          isMobile: "(max-width: 767px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion } = context.conditions as {
            isDesktop: boolean;
            isMobile: boolean;
            reduceMotion: boolean;
          };

          if (reduceMotion) {
            gsap.set(
              [
                leftColRef.current,
                centerColRef.current,
                rightColRef.current,
                ctaRef.current,
              ],
              { autoAlpha: 1, y: 0, x: 0 },
            );
            return;
          }

          const tl = gsap.timeline({
            defaults: { duration: 0.8, ease: "power3.out" },
            delay: 0.2,
          });

          /* Left column fades & rises */
          tl.fromTo(
            leftColRef.current,
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
          );

          /* Center particle logo fades in */
          tl.fromTo(
            centerColRef.current,
            { autoAlpha: 0, scale: 0.95 },
            { autoAlpha: 1, scale: 1, duration: 0.9 },
            "<0.1",
          );

          /* Right column list items stagger in */
          const rightItems =
            rightColRef.current?.querySelectorAll(".hero-feature-item");
          if (rightItems?.length) {
            tl.fromTo(
              rightItems,
              { autoAlpha: 0, x: 20 },
              {
                autoAlpha: 1,
                x: 0,
                stagger: 0.1,
                duration: 0.6,
              },
              "<0.2",
            );
          } else {
            tl.fromTo(
              rightColRef.current,
              { autoAlpha: 0, x: 20 },
              { autoAlpha: 1, x: 0, duration: 0.6 },
              "<0.2",
            );
          }

          /* CTA buttons slide in */
          tl.fromTo(
            ctaRef.current,
            { autoAlpha: 0, y: 15 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            "<0.1",
          );
        },
      );
    },
    { scope: containerRef },
  );

  return { containerRef, leftColRef, centerColRef, rightColRef, ctaRef };
}
