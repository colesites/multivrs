"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronDown,
  Activity,
  Globe,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Code,
  MoreHorizontal,
  Lock,
} from "lucide-react";

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

  const alerts = [
    { id: "1", type: "DDoS Attack", time: "3h ago", status: "Resolved", count: "950.8k", active: false },
    { id: "2", type: "DDoS Attack", time: "5h ago", status: "Active", count: "3.0k", active: true },
    { id: "3", type: "DDoS Attack", time: "12h ago", status: "Resolved", count: "2.0k", active: false },
    { id: "4", type: "DDoS Attack", time: "3d ago", status: "Resolved", count: "1.7k", active: false },
  ];

  const rules = [
    { name: "Log Next.js prefetch infinite loop", count: "2.5M" },
    { name: "Bot Protection", count: "1.2M" },
    { name: "Log-only /api", count: "473.0k" },
    { name: "DDoS Mitigation", count: "288.7k" },
    { name: "Log-only /", count: "112.0k" },
  ];

  return (
    <div className="relative w-full max-w-full lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl">
      {/* Top ambient spotlight */}
      <div
        className="pointer-events-none absolute -top-8 inset-x-0 h-44 w-full"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 25%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
        aria-hidden="true"
      />      {/* Main card */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-4 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden text-white"
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
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950 px-2 py-0.5 text-[10px] font-sans text-zinc-300 hover:border-white/20 transition-colors"
          >
            <Clock className="size-2.5 text-zinc-500" />
            <span>Past hour</span>
            <ChevronDown className="size-2.5 text-zinc-500 ml-1" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950 px-2 py-0.5 text-[10px] font-sans text-zinc-300 hover:border-white/20 transition-colors"
          >
            <span>Overview</span>
            <ChevronDown className="size-2.5 text-zinc-500 ml-1" />
          </button>
        </div>

        {/* Top Grid: Firewall Status Card + Traffic Metrics/Chart Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2.5">
          {/* Left Firewall Active Card with Purple Shield */}
          <div className="md:col-span-4 rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-black p-3 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 to-transparent blur-xl pointer-events-none" />
            <div className="text-center py-1.5 relative z-10">
              <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#A855F7] mb-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Shield className="size-4.5" />
              </div>
              <p className="font-sans text-xs font-semibold text-white">
                Firewall is active
              </p>
            </div>
            <div className="space-y-1 border-t border-white/10 pt-2 text-[9px] relative z-10 font-sans">
              <div className="flex justify-between">
                <span className="text-zinc-400">Bot Protection</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Custom Rules</span>
                <span className="text-white font-mono">8</span>
              </div>
            </div>
          </div>

          {/* Right Metrics & Traffic Chart Card */}
          <div className="md:col-span-8 rounded-xl border border-white/10 bg-zinc-950/80 p-2.5 flex flex-col justify-between relative">
            {/* Horizontal Metric Strip */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
              {metrics.map((m) => {
                const isActive = activeMetric === m.id;
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMetric(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isActive ? "border-b-2 border-white pb-0.5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[8px] text-zinc-400 mb-0.5">
                      <Icon className="size-2 text-zinc-500" />
                      <span className="truncate">{m.label}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-white block">
                      {m.val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Chart Area */}
            <div className="relative h-20 w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 inset-y-0 flex flex-col justify-between font-mono text-[7px] text-zinc-600">
                <span>50k</span>
                <span>25k</span>
                <span>0k</span>
              </div>

              {/* SVG Multi-Line Chart (Purple + Emerald) */}
              <div className="ml-5 h-full w-[calc(100%-1.25rem)] relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70" preserveAspectRatio="none">
                  <line x1="0" y1="15" x2="300" y2="15" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="65" x2="300" y2="65" stroke="rgba(255,255,255,0.05)" />

                  <path
                    d="M 0 40 L 35 25 L 70 38 L 110 20 L 140 45 L 180 45 L 215 22 L 260 38 L 300 42"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 60 L 35 60 L 70 52 L 110 52 L 140 64 L 180 58 L 215 60 L 260 62 L 300 56"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Split: Alerts + Rules (Compact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Left Alerts Card */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-2.5">
            <p className="text-[10px] font-semibold text-white mb-1">Active Mitigation</p>
            <div className="space-y-1 text-[9.5px]">
              {alerts.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-0.5 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-medium">{a.type}</span>
                    <span className="font-mono text-[8px] text-zinc-500">{a.time}</span>
                  </div>
                  <span className="font-mono text-[9px] text-emerald-400">{a.count} mitigated</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Rules Card */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-2.5">
            <p className="text-[10px] font-semibold text-white mb-1">Custom Rules</p>
            <div className="space-y-1 text-[9.5px]">
              {rules.slice(0, 2).map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between py-0.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-zinc-300 truncate pr-2">
                    {r.name}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Black Gradient Fade Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-2xl"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.85) 75%, #000000 100%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
