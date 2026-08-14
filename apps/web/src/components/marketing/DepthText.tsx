"use client";

import { useEffect, useRef, useState } from "react";

interface DepthTextProps {
  text?: string;
  className?: string;
}

export function DepthText({
  text = "COMING SOON",
  className = "",
}: DepthTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      setOffset({
        x: Math.max(Math.min(normX * 14, 18), -18),
        y: Math.max(Math.min(normY * 14, 18), -18),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Multi-layered extruded shadow projection
  const shadowLayers = [
    `1px 1px 0px rgba(255, 255, 255, 0.45)`,
    `2px 2px 0px #383838`,
    `3px 3px 0px #2c2c2c`,
    `4px 4px 0px #222222`,
    `5px 5px 0px #1a1a1a`,
    `6px 6px 0px #141414`,
    `7px 7px 0px #0f0f0f`,
    `8px 8px 0px #0a0a0a`,
    `9px 9px 0px #050505`,
    `10px 10px 0px rgba(168, 85, 247, 0.4)`,
    `14px 14px 24px rgba(0, 0, 0, 0.95)`,
    `20px 20px 48px rgba(168, 85, 247, 0.3)`,
  ].join(", ");

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      style={{
        perspective: "1200px",
      }}
    >
      <div
        className="transition-transform duration-150 ease-out will-change-transform"
        style={{
          transform: `rotateX(${-offset.y * 0.7}deg) rotateY(${offset.x * 0.7}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <h1
          className="font-mono text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] 2xl:text-[11rem] font-black uppercase tracking-tighter text-white whitespace-nowrap leading-none"
          style={{
            textShadow: shadowLayers,
          }}
        >
          {text}
        </h1>
      </div>
    </div>
  );
}
