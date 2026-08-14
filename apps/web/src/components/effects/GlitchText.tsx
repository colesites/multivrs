"use client";

import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  subtitle?: string;
  speed?: number; // Speed in milliseconds (lower = faster)
  enableShadows?: boolean;
}

export function GlitchText({
  text,
  className = "",
  subtitle,
  speed = 40,
  enableShadows = true,
}: GlitchTextProps) {
  const [sliceTop, setSliceTop] = useState({ clip: "polygon(0 20%, 100% 20%, 100% 45%, 0 45%)", x: -4, y: 2 });
  const [sliceBottom, setSliceBottom] = useState({ clip: "polygon(0 60%, 100% 60%, 100% 85%, 0 85%)", x: 4, y: -2 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const currentSpeed = isHovered ? Math.max(speed * 0.4, 20) : speed;

    const interval = setInterval(() => {
      // High-speed random horizontal slice bounds
      const y1 = Math.floor(Math.random() * 45);
      const y2 = y1 + Math.floor(Math.random() * 25) + 5;
      const y3 = Math.floor(Math.random() * 50) + 45;
      const y4 = y3 + Math.floor(Math.random() * 25) + 5;

      const shiftX1 = (Math.random() - 0.5) * (isHovered ? 14 : 9);
      const shiftY1 = (Math.random() - 0.5) * (isHovered ? 5 : 3);
      const shiftX2 = (Math.random() - 0.5) * (isHovered ? -14 : -9);
      const shiftY2 = (Math.random() - 0.5) * (isHovered ? -5 : -3);

      setSliceTop({
        clip: `polygon(0 ${y1}%, 100% ${y1}%, 100% ${y2}%, 0 ${y2}%)`,
        x: shiftX1,
        y: shiftY1,
      });

      setSliceBottom({
        clip: `polygon(0 ${y3}%, 100% ${y3}%, 100% ${y4}%, 0 ${y4}%)`,
        x: shiftX2,
        y: shiftY2,
      });
    }, currentSpeed);

    return () => clearInterval(interval);
  }, [speed, isHovered]);

  return (
    <div
      className="relative inline-flex flex-col items-center select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative inline-block">
        {/* Base Crisp White Text */}
        <span
          className={`relative z-10 block font-mono font-black tracking-tight text-white ${className}`}
          style={{
            letterSpacing: "-0.04em",
            textShadow: enableShadows
              ? "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)"
              : undefined,
          }}
        >
          {text}
        </span>

        {/* Rapid Purple/Violet Glitch Slice Layer */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-20 block font-mono font-black tracking-tight text-[#A855F7] mix-blend-screen transition-transform duration-75 ${className}`}
          style={{
            letterSpacing: "-0.04em",
            clipPath: sliceTop.clip,
            transform: `translate(${sliceTop.x}px, ${sliceTop.y}px)`,
            opacity: 0.95,
            filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))",
          }}
        >
          {text}
        </span>

        {/* Rapid Cyan Glitch Slice Layer */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-20 block font-mono font-black tracking-tight text-cyan-400 mix-blend-screen transition-transform duration-75 ${className}`}
          style={{
            letterSpacing: "-0.04em",
            clipPath: sliceBottom.clip,
            transform: `translate(${sliceBottom.x}px, ${sliceBottom.y}px)`,
            opacity: 0.95,
            filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))",
          }}
        >
          {text}
        </span>

        {/* Fast Micro Noise Offset Layer */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-0 block font-mono font-black tracking-tight text-white/40 opacity-70 ${className}`}
          style={{
            letterSpacing: "-0.04em",
            transform: `translate(${-sliceTop.x * 0.4}px, ${-sliceTop.y * 0.4}px)`,
          }}
        >
          {text}
        </span>
      </div>

      {subtitle && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-[#A855F7] animate-ping" />
          <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-[#A855F7] font-bold">
            {subtitle}
          </span>
          <span className="inline-block size-1.5 rounded-full bg-[#A855F7] animate-ping" />
        </div>
      )}
    </div>
  );
}
