"use client";

import { useRef } from "react";
import { ParticleWordmark } from "@/components/marketing/ParticleWordmark";

export function BrandWordmark() {
  const root = useRef<HTMLElement>(null);

  return (
    <section
      ref={root}
      className="relative flex flex-col items-center justify-center overflow-hidden w-full h-[60vh] min-h-[400px]"
    >
      <div className="absolute top-10 z-10">
        <p className="font-mono text-xs tracking-[0.35em] text-white/35 uppercase">
          Software for the next universe
        </p>
      </div>

      {/* 3D Particle Text taking full space */}
      <ParticleWordmark />
    </section>
  );
}
