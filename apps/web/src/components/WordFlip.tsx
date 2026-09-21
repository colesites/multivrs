"use client";

import { useEffect, useState } from "react";

interface WordFlipProps {
  words: string[];
  duration?: number;
  className?: string;
  /**
   * Classes for the word itself. Pass "" to inherit the parent's colour, which
   * lets the word take part in a gradient applied with `bg-clip-text`.
   */
  wordClassName?: string;
}

export function WordFlip({
  words,
  duration = 2400,
  className = "",
  wordClassName = "text-white",
}: WordFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsFlipping(false);
      }, 400); // Halfway through transition
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  const currentWord = words[currentIndex] || "";

  return (
    <span
      className={`relative inline-flex items-center justify-center lg:justify-start ${className}`}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <span
        className={`inline-block ${wordClassName} ${
          isFlipping
            ? "opacity-0 -translate-y-3 sm:-translate-y-4 sm:rotate-x-90 sm:blur-[2px]"
            : "opacity-100 translate-y-0 sm:rotate-x-0 sm:blur-0"
        }`}
        style={{
          // Written out rather than left to utility classes: mobile Safari
          // skips the tween when the transition is declared as `all`. Phones
          // also drop the 3D rotation and blur when the word sits inside a
          // `bg-clip-text` heading, so small screens fade and slide instead.
          transitionProperty: "opacity, transform, filter",
          transitionDuration: "400ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: "50% 50% -10px",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          willChange: "opacity, transform",
        }}
      >
        {currentWord}
      </span>
    </span>
  );
}
