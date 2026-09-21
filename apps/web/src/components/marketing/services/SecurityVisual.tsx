"use client";

import {
  Activity,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export function SecurityVisual() {
  const [activeMetric, setActiveMetric] = useState("all");

  const metrics = [
    { id: "all", label: "All Traffic", val: "1.0M", icon: Globe },
    { id: "allowed", label: "Allowed", val: "950.8k", icon: ShieldCheck },
    { id: "denied", label: "Denied", val: "3.0k", icon: Ban },
    { id: "challenged", label: "Challenged", val: "15.0k", icon: ShieldAlert },
    { id: "logged", label: "Logged", val: "45.0k", icon: Code },
    { id: "ratelimit", label: "Rate limited", val: "—", icon: Activity },
  ];

  const sparklineBars = [
    { id: "sb-1", h: 30 },
    { id: "sb-2", h: 45 },
    { id: "sb-3", h: 25 },
    { id: "sb-4", h: 60 },
    { id: "sb-5", h: 40 },
    { id: "sb-6", h: 75 },
    { id: "sb-7", h: 50 },
    { id: "sb-8", h: 85 },
    { id: "sb-9", h: 35 },
    { id: "sb-10", h: 90 },
    { id: "sb-11", h: 65 },
    { id: "sb-12", h: 40 },
    { id: "sb-13", h: 55 },
    { id: "sb-14", h: 70 },
    { id: "sb-15", h: 80 },
    { id: "sb-16", h: 45 },
    { id: "sb-17", h: 60 },
    { id: "sb-18", h: 30 },
    { id: "sb-19", h: 50 },
    { id: "sb-20", h: 70 },
    { id: "sb-21", h: 40 },
    { id: "sb-22", h: 60 },
    { id: "sb-23", h: 80 },
    { id: "sb-24", h: 50 },
  ];

  return (
    <div className="relative w-full max-w-full lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
      {/* Top ambient spotlight */}
      <div
        className="pointer-events-none absolute -top-8 inset-x-0 h-44 w-full"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 25%, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.02) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
        aria-hidden="true"
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#000000] p-4 sm:p-5 shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden text-zinc-900 dark:text-white transition-colors"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 70%, rgba(0,0,0,0.65) 86%, rgba(0,0,0,0.1) 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 70%, rgba(0,0,0,0.65) 86%, rgba(0,0,0,0.1) 96%, transparent 100%)",
        }}
      >
        {/* Top Dropdowns Bar */}
        <div className="flex items-center gap-2 mb-2.5">
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 text-[10px] font-sans text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
          >
            <Clock className="size-2.5 text-zinc-400 dark:text-zinc-500" />
            <span>Past hour</span>
            <ChevronDown className="size-2.5 text-zinc-400 dark:text-zinc-500 ml-1" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 text-[10px] font-sans text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
          >
            <span>Overview</span>
            <ChevronDown className="size-2.5 text-zinc-400 dark:text-zinc-500 ml-1" />
          </button>
        </div>

        {/* Top Grid: Firewall Status Card + Traffic Metrics/Chart Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2.5">
          {/* Left Firewall Active Card with Purple Shield */}
          <div className="md:col-span-4 rounded-xl border border-purple-500/20 bg-li-to-b from-purple-500/10 via-zinc-50 dark:via-zinc-950 to-transparent p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="text-center py-1.5 relative z-10">
              <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#A855F7] mb-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Shield className="size-4.5" />
              </div>
              <p className="font-sans text-xs font-semibold text-zinc-950 dark:text-white">
                Firewall is active
              </p>
            </div>
            <div className="space-y-1 border-t border-zinc-200 dark:border-white/10 pt-2 text-[9px] relative z-10 font-sans">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>Managed rules</span>
                <span className="font-semibold text-zinc-950 dark:text-white">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span>OWASP Top 10</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Protected
                </span>
              </div>
            </div>
          </div>

          {/* Right Metrics & Compact Chart Card */}
          <div className="md:col-span-8 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 flex flex-col justify-between">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mb-2">
              {metrics.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`rounded-lg p-1 text-center transition-all cursor-pointer ${
                    activeMetric === m.id
                      ? "bg-zinc-200/80 dark:bg-white/10 border border-zinc-300 dark:border-white/20"
                      : "hover:bg-zinc-200/40 dark:hover:bg-white/5"
                  }`}
                >
                  <p className="font-sans text-[8px] text-zinc-500 dark:text-zinc-400 truncate">
                    {m.label}
                  </p>
                  <p className="font-mono text-[10px] font-bold text-zinc-950 dark:text-white">
                    {m.val}
                  </p>
                </button>
              ))}
            </div>

            {/* Micro Sparkline Chart */}
            <div className="h-10 w-full relative flex items-end gap-1 px-1">
              {sparklineBars.map((bar) => (
                <div
                  key={bar.id}
                  className="flex-1 rounded-t bg-purple-500/40 dark:bg-purple-500/30 hover:bg-purple-500 transition-colors"
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Rules Summary Bar */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9.5px] font-mono">
            <span className="text-zinc-500 dark:text-zinc-400">
              Mitigation Rules:
            </span>
            <span className="text-zinc-950 dark:text-white font-semibold">
              2.5M requests inspected
            </span>
          </div>
          <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="size-2.5" />
            <span>0 bypasses</span>
          </span>
        </div>

        {/* Bottom Gradient Fade Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-2xl bg-linear-to-b from-transparent via-white/40 to-white dark:via-black/85 dark:to-black"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
