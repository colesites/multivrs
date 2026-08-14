import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Radio } from "lucide-react";
import { GridDistortion } from "@/components/effects/GridDistortion";
import { GlitchText } from "@/components/effects/GlitchText";
import SpecularButton from "@/components/SpecularButton";

export const metadata: Metadata = {
  title: "404 · Page Not Found · Multivrs",
  description: "The coordinate you requested does not exist in this universe.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-[100vh] h-[100vh] w-full overflow-hidden bg-black text-white flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Interactive Black & Purple Grid Distortion Canvas Background */}
      <GridDistortion grid={18} mouse={0.25} strength={0.45} relaxation={0.9} />

      {/* Top Ambient Spotlight */}
      <div
        className="pointer-events-none absolute -top-24 inset-x-0 h-96 w-full"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(168, 85, 247, 0.25) 0%, rgba(255, 255, 255, 0.03) 40%, transparent 80%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      {/* Top Nav: Back to Platform */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Return Home</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#A855F7] bg-[#A855F7]/10 px-3 py-1 rounded-full border border-[#A855F7]/25 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
          <span className="size-1.5 rounded-full bg-[#A855F7] animate-pulse" />
          <span>HTTP 404</span>
        </div>
      </div>

      {/* Center Hero: Glitch 404 + Subtitle + Action Buttons */}
      <div className="relative z-10 mx-auto my-auto w-full max-w-4xl text-center flex flex-col items-center justify-center py-6">
        {/* Chromatic Glitch 404 Text */}
        <GlitchText
          text="404"
          subtitle="PAGE NOT FOUND"
          className="text-7xl sm:text-9xl md:text-[10rem] lg:text-[12rem] leading-none"
        />

        {/* Descriptive Subtext */}
        <p className="mt-6 max-w-lg font-sans text-sm sm:text-base leading-relaxed text-zinc-400">
          The universe coordinate or edge route you requested does not exist or has been relocated.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/home">
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.95}
              baseColor="#ffffff"
              lineColor="#ffffff"
              textColor="#000000"
            >
              <span className="flex items-center gap-1.5 font-semibold text-xs">
                <Compass className="size-3.5" />
                <span>Return to Home</span>
              </span>
            </SpecularButton>
          </Link>
          <Link href="/docs">
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#1c1c1c"
              lineColor="#ffffff"
              textColor="#ffffff"
            >
              <span className="flex items-center gap-1.5 font-medium text-xs">
                <BookOpen className="size-3.5" />
                <span>Explore Docs</span>
              </span>
            </SpecularButton>
          </Link>
          <Link href="/status">
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#1c1c1c"
              lineColor="#ffffff"
              textColor="#ffffff"
            >
              <span className="flex items-center gap-1.5 font-medium text-xs">
                <Radio className="size-3.5 text-[#A855F7]" />
                <span>System Status</span>
              </span>
            </SpecularButton>
          </Link>
        </div>
      </div>

      {/* Bottom Footer Metadata */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between font-mono text-[11px] text-zinc-600">
        <span>MULTIVRS</span>
        <span className="text-zinc-500">ERROR_CODE: 0x404_ROUTE_NOT_FOUND</span>
        <span>2026</span>
      </div>
    </main>
  );
}
