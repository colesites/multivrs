"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AcidSquaresBackground } from "@/components/marketing/AcidSquaresBackground";
import { DepthText } from "@/components/marketing/DepthText";
import SpecularButton from "@/components/SpecularButton";

export function ComingSoonPage() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] w-full overflow-hidden bg-black text-white flex flex-col justify-center items-center py-20 px-6 select-none">
      {/* Interactive Acid Squares Canvas Background */}
      <AcidSquaresBackground />

      {/* Top Ambient Spotlight */}
      <div
        className="pointer-events-none absolute -top-24 inset-x-0 h-96 w-full"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(168, 85, 247, 0.22) 0%, rgba(255, 255, 255, 0.04) 40%, transparent 80%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      {/* Center Hero: Massive 3D Depth Text + Sleek Action Buttons */}
      <div className="relative z-10 w-full max-w-7xl text-center flex flex-col items-center justify-center py-8">
        {/* Massive 3D Depth Text */}
        <div className="w-full flex justify-center items-center overflow-visible py-4">
          <DepthText text="COMING SOON" />
        </div>

        {/* Action Buttons Directly Underneath */}
        <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs">
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
                <BookOpen className="size-3.5" />
                <span>Explore Docs</span>
              </span>
            </SpecularButton>
          </Link>
          <Link href="/home">
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#1c1c1c"
              lineColor="#ffffff"
              textColor="#ffffff"
            >
              <span className="font-medium text-xs">Explore Platform</span>
            </SpecularButton>
          </Link>
          <Link href="/shipped">
            <SpecularButton
              size="sm"
              radius={9999}
              tint="#ffffff"
              tintOpacity={0.05}
              baseColor="#1c1c1c"
              lineColor="#ffffff"
              textColor="#ffffff"
            >
              <span className="font-medium text-xs">View Changelog</span>
            </SpecularButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
