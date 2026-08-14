"use client";

import { useEffect, useState } from "react";

interface WordFlipProps {
  words: string[];
  duration?: number;
  className?: string;
}

export function WordFlip({
  words,
  duration = 2400,
  className = "",
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
    <div
      className={`relative inline-flex items-center justify-center lg:justify-start ${className}`}
      style={{ perspective: "1000px" }}
    >
      <span
        className={`inline-block transition-all duration-400 ease-out will-change-transform ${
          isFlipping
            ? "opacity-0 -translate-y-4 rotate-x-90 blur-[2px]"
            : "opacity-100 translate-y-0 rotate-x-0 blur-0"
        }`}
        style={{
          transformOrigin: "50% 50% -10px",
        }}
      >
        {currentWord}
      </span>
    </div>
  );
}
