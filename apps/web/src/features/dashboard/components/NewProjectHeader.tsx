"use client";

import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import SpecularButton from "@/components/SpecularButton";

export function NewProjectHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-white/10 bg-[#030303]/90 px-6 backdrop-blur-md">
      {/* Left: Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs font-medium text-white/60 transition-colors hover:text-white cursor-pointer select-none"
      >
        <ArrowLeft className="size-3.5" />
        <span>Back</span>
      </button>

      {/* Center: Title */}
      <h1 className="text-xs font-semibold tracking-wide text-white/90">
        New Project
      </h1>

      {/* Right: Actions & User Avatar */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Settings"
          className="text-white/40 transition-colors hover:text-white cursor-pointer p-1"
        >
          <Settings className="size-4" />
        </button>

        <div className="grid size-6 place-items-center rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-white select-none">
          ▲
        </div>

        <SpecularButton
          size="sm"
          radius={8}
          tint="#ffffff"
          tintOpacity={0.06}
          baseColor="#333333"
          lineColor="#a855f7"
          textColor="#ffffff"
          className="!h-7 !px-3 !text-xs font-medium"
        >
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
            Collaborate on Pro
          </span>
        </SpecularButton>
      </div>
    </header>
  );
}
