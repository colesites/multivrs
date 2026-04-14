"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * GSAP timeline animation for hero content entrance.
 * Staggered reveals: eyebrow → headline words → subtitle → CTAs → stats
 */
export function useHeroAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
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
                eyebrowRef.current,
                headlineRef.current,
                subtitleRef.current,
                ctaRef.current,
              ],
              { autoAlpha: 1, y: 0 }
            );
            return;
          }

          const tl = gsap.timeline({
            defaults: { duration: 0.8, ease: "power3.out" },
            delay: 0.3,
          });

          /* Eyebrow badge slides up */
          tl.from(eyebrowRef.current, {
            autoAlpha: 0,
            y: 30,
            duration: 0.6,
          });

          /* Headline words stagger in */
          const words = headlineRef.current?.querySelectorAll(".hero-word");
          if (words?.length) {
            tl.from(
              words,
              {
                autoAlpha: 0,
                y: 60,
                rotationX: 15,
                stagger: 0.08,
                duration: 0.9,
              },
              "<0.15"
            );
          }

          /* Subtitle fades up */
          tl.from(
            subtitleRef.current,
            { autoAlpha: 0, y: 25, duration: 0.7 },
            "<0.3"
          );

          /* CTA buttons slide in */
          tl.from(
            ctaRef.current,
            { autoAlpha: 0, y: 20, duration: 0.6 },
            "<0.2"
          );
        }
      );
    },
    { scope: containerRef }
  );

  return { containerRef, eyebrowRef, headlineRef, subtitleRef, ctaRef };
}
