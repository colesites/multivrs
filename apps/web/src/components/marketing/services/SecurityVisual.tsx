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
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-4 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden text-white"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 62%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0.1) 95%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 62%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0.1) 95%, transparent 100%)",
        }}
      >
        {/* Top Dropdowns Bar */}
        <div className="flex items-center gap-2 mb-3.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-sans text-zinc-300 hover:border-white/20 transition-colors"
          >
            <Clock className="size-3 text-zinc-500" />
            <span>Past hour</span>
            <ChevronDown className="size-3 text-zinc-500 ml-1" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1 text-xs font-sans text-zinc-300 hover:border-white/20 transition-colors"
          >
            <span>Overview</span>
            <ChevronDown className="size-3 text-zinc-500 ml-1" />
          </button>
        </div>

        {/* Top Grid: Firewall Status Card + Traffic Metrics/Chart Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
          {/* Left Firewall Active Card with Purple Shield */}
          <div className="md:col-span-4 rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/20 to-black p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 to-transparent blur-xl pointer-events-none" />
            <div className="text-center py-3 relative z-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/30 text-[#A855F7] mb-2.5 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <Shield className="size-6" />
              </div>
              <p className="font-sans text-xs sm:text-sm font-semibold text-white">
                Firewall is active
              </p>
            </div>
            <div className="space-y-1.5 border-t border-white/10 pt-3 text-[10px] relative z-10 font-sans">
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
          <div className="md:col-span-8 rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 flex flex-col justify-between relative">
            {/* Horizontal Metric Strip */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 border-b border-white/10 pb-2.5 mb-2.5">
              {metrics.map((m) => {
                const isActive = activeMetric === m.id;
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMetric(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isActive ? "border-b-2 border-white pb-1" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-zinc-400 mb-0.5">
                      <Icon className="size-2.5 text-zinc-500" />
                      <span className="truncate">{m.label}</span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold text-white block">
                      {m.val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live Chart Area */}
            <div className="relative h-28 w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 inset-y-0 flex flex-col justify-between font-mono text-[8px] text-zinc-600">
                <span>50k</span>
                <span>30k</span>
                <span>10k</span>
                <span>0k</span>
              </div>

              {/* Floating Action Badge */}
              <div className="absolute right-6 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/90 px-2.5 py-1 text-[10px] text-white shadow-xl backdrop-blur-md">
                <Ban className="size-3 text-rose-400" />
                <span>Deny traffic from Germany</span>
              </div>

              {/* SVG Multi-Line Chart (Purple + Emerald) */}
              <div className="ml-7 h-full w-[calc(100%-1.75rem)] relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.05)" />

                  {/* Top Purple Traffic Line */}
                  <path
                    d="M 0 50 L 35 30 L 70 48 L 110 25 L 140 55 L 180 55 L 215 28 L 260 48 L 300 52"
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="2"
                  />

                  {/* Bottom Emerald Protected Line */}
                  <path
                    d="M 0 75 L 35 75 L 70 65 L 110 65 L 140 82 L 180 72 L 215 75 L 260 78 L 300 70"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Timestamps */}
                <div className="flex justify-between font-mono text-[8px] text-zinc-600 mt-1">
                  <span>12:47:00 PM</span>
                  <span>1:05:00 PM</span>
                  <span>1:23:00 PM</span>
                  <span>1:32:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Split: Alerts + Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left Alerts Card */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 relative">
            {/* Floating Challenge Badge */}
            <div className="absolute -top-3 left-6 z-10 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black px-2.5 py-0.5 text-[9.5px] text-white shadow-lg">
              <ShieldAlert className="size-2.5 text-[#A855F7]" />
              <span>Challenge user agents that look like bots</span>
            </div>

            <p className="text-xs font-semibold text-white mb-2 pt-1">Alerts</p>
            <div className="space-y-1.5">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white font-medium">{a.type}</span>
                    <span className="font-mono text-[9px] text-zinc-500">{a.time}</span>
                    {a.active ? (
                      <span className="flex items-center gap-1 font-mono text-[8.5px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        <AlertTriangle className="size-2" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-[8.5px] text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded">
                        <CheckCircle2 className="size-2 text-zinc-400" />
                        Resolved
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">{a.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Rules Card */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 relative">
            {/* Floating Rule Badge */}
            <div className="absolute -top-3 right-6 z-10 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black px-2.5 py-0.5 text-[9.5px] text-white shadow-lg">
              <Code className="size-2.5 text-purple-400" />
              <span>Log request starting with /</span>
            </div>

            <p className="text-xs font-semibold text-white mb-2 pt-1">Rules</p>
            <div className="space-y-1.5">
              {rules.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 text-xs group"
                >
                  <span className="text-[11px] text-zinc-300 truncate pr-2 group-hover:text-white transition-colors">
                    {r.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[9.5px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded">
                      {r.count}
                    </span>
                    <MoreHorizontal className="size-3 text-zinc-600 group-hover:text-zinc-300 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Black Gradient Fade Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 rounded-b-2xl"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 30%, rgba(0, 0, 0, 0.75) 65%, #000000 100%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
