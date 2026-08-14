"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MultivrsMark } from "@/components/brand/Logo";
import Galaxy from "@/components/Galaxy";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Authentication shell — a single centered card floating over a full-bleed,
 * monochrome galaxy starfield. Follows the marketing design language:
 * #030303 base, restrained purple (#A855F7) accent, hairline borders, no
 * gradient fills. Deliberately "dev tool" plain rather than glossy.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#030303] px-6 py-12">
      {/* Galaxy starfield */}
      <div className="absolute inset-0 z-0">
        <Galaxy
          density={0.9}
          starSpeed={0.25}
          speed={0.6}
          glowIntensity={0.18}
          saturation={0.0}
          twinkleIntensity={0.45}
          rotationSpeed={0.04}
          mouseInteraction={true}
          mouseRepulsion={true}
          repulsionStrength={2}
          transparent
        />
      </div>

      {/* Radial vignette for legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 0%, rgba(3,3,3,0.55) 70%, rgba(3,3,3,0.9) 100%)",
        }}
      />

      {/* Brand mark */}
      <Link
        href="/home"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
      >
        <MultivrsMark className="size-6 text-[#A855F7]" />
        <span className="font-clash text-lg font-semibold tracking-tight">
          Multivrs
        </span>
      </Link>

      {/* Card */}
      <div className="relative z-20 w-full max-w-[400px]">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-10">
          {children}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-white/30">
          Build · Deploy · Scale
        </p>
      </div>
    </div>
  );
}
