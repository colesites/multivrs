"use client";

import { useRef } from "react";
import {
  gsap,
  parallax,
  prefersReducedMotion,
  useGSAP,
} from "@/components/marketing/scroll";

/**
 * The brand crescendo: a single, oversized MULTIVRS wordmark. Each letter is a
 * real span (React owns the DOM; GSAP just animates it — no SplitText injection
 * that a re-render could revert). Letters assemble locked to scroll position for
 * a cinematic build, then the word and tagline drift at different speeds for
 * layered parallax. Clean — no gradients, no fills.
 */
const LETTERS = "MULTIVRS".split("");

export function BrandWordmark() {
  const root = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      const letters =
        wordRef.current?.querySelectorAll<HTMLElement>("[data-letter]");

      if (letters?.length) {
        if (prefersReducedMotion()) {
          gsap.from(letters, {
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: "power1.out",
            scrollTrigger: {
              trigger: root.current,
              start: "top 80%",
              once: true,
            },
          });
        } else {
          gsap.from(letters, {
            yPercent: 130,
            autoAlpha: 0,
            rotateX: -55,
            transformOrigin: "50% 100%",
            stagger: 0.06,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top 85%",
              end: "top 35%",
              scrub: 1,
            },
          });
        }
      }

      // Layered scroll parallax: word drifts up slowly, tagline opposite.
      parallax(wordRef.current, { yPercent: -10, trigger: root.current });
      parallax(taglineRef.current, { yPercent: 60, trigger: root.current });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex flex-col items-center overflow-hidden px-4 py-28 lg:py-44"
    >
      <p
        ref={taglineRef}
        className="mb-8 font-mono text-xs tracking-[0.35em] text-white/35 uppercase lg:mb-12"
      >
        Software for the next universe
      </p>
      <div
        ref={wordRef}
        role="img"
        aria-label="Multivrs"
        style={{ perspective: "1200px" }}
        className="select-none whitespace-nowrap text-center font-clash text-[clamp(2.75rem,19vw,17rem)] font-bold leading-[0.8] tracking-tighter text-white"
      >
        {LETTERS.map((char) => (
          <span
            key={char}
            data-letter
            aria-hidden="true"
            className="inline-block will-change-transform"
          >
            {char}
          </span>
        ))}
      </div>
    </section>
  );
}
