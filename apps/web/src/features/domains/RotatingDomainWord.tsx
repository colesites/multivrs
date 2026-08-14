"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

const WORDS = ["passion.", "project.", "idea.", "venture."];
const FIRST_WORD = "passion.";

export function RotatingDomainWord() {
  const word = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!word.current) return;
      let index = 0;
      const timeline = gsap.timeline({ repeat: -1 });
      timeline
        .to(word.current, {
          yPercent: -110,
          opacity: 0,
          delay: 1.35,
          duration: 0.45,
          ease: "power3.in",
          onComplete: () => {
            index = (index + 1) % WORDS.length;
            if (word.current)
              word.current.textContent = WORDS[index] ?? FIRST_WORD;
          },
        })
        .set(word.current, { yPercent: 110 })
        .to(word.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power3.out",
        });
    },
    { scope: word },
  );

  return (
    <span className="relative block h-[1.08em] overflow-hidden text-purple-400">
      <span ref={word} className="absolute inset-0 block">
        {FIRST_WORD}
      </span>
    </span>
  );
}
