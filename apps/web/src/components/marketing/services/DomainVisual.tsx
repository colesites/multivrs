"use client";

import { useState } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  Search,
  Server,
  Lock,
  Layers,
  Rocket,
  FileText,
  Activity,
  Zap,
  Eye,
  ShieldAlert,
  Wifi,
  Settings,
  Mail,
  Copy,
  CheckCircle2,
} from "lucide-react";

export function DomainVisual() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const sidebarNav = [
    { name: "Projects", icon: Layers, badge: "Beta" },
    { name: "Deployments", icon: Rocket, badge: "Beta" },
    { name: "Logs", icon: FileText, badge: "Beta" },
    { name: "Domains", icon: Globe, active: true },
    { name: "Emails", icon: Mail },
    { name: "Settings", icon: Settings, badge: "Beta" },
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

      {/* Main card replicating the Domain detail dashboard */}
      <div
        className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#000000] p-3 sm:p-4 shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden flex gap-3 text-zinc-900 dark:text-white transition-colors"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 68%, rgba(0,0,0,0.65) 84%, rgba(0,0,0,0.1) 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 68%, rgba(0,0,0,0.65) 84%, rgba(0,0,0,0.1) 96%, transparent 100%)",
        }}
      >
        {/* Left Sidebar */}
        <div className="hidden sm:flex flex-col w-32 shrink-0 border-r border-zinc-200 dark:border-white/10 pr-2">
          {/* User info */}
          <div className="flex items-center gap-1.5 px-1 pb-2 mb-1.5 border-b border-zinc-200 dark:border-white/10">
            <div className="grid size-4.5 place-items-center rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[8px] font-bold text-zinc-900 dark:text-white">
              C
            </div>
            <span className="font-mono text-[9.5px] text-zinc-700 dark:text-zinc-300">ctech</span>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-1 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-1.5 py-0.5 mb-1.5 text-[9px] text-zinc-500 dark:text-zinc-400 focus-within:border-zinc-400 dark:focus-within:border-white/30 transition-colors">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <Search className="size-2.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[9px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
              />
            </div>
            <span className="font-mono text-[7px] text-zinc-500 bg-zinc-200/60 dark:bg-white/5 px-1 py-0.2 rounded border border-zinc-200 dark:border-white/5 shrink-0">
              ⌘K
            </span>
          </div>

          {/* Navigation Items */}
          <div className="space-y-0.5 text-xs">
            {sidebarNav.map((item) => {
              const isActive = item.active;
              return (
                <div
                  key={item.name}
                  className={`relative flex items-center justify-between px-1.5 py-0.5 rounded-md text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-medium shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <item.icon className="size-3 text-zinc-500 dark:text-zinc-400" />
                    <span className="truncate text-[10px] font-sans">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-zinc-200/70 dark:bg-white/10 px-1 py-0.2 font-mono text-[7px] text-zinc-700 dark:text-zinc-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Top Domain Header Banner */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Globe className="size-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                    multivrs.dev
                  </h5>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[8px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-[8.5px] text-zinc-500 dark:text-zinc-400 font-sans">
                  Auto-renews on Jan 14, 2027 · Anycast Edge DNS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 text-[9px] font-mono text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
              >
                <RefreshCw className="size-2.5 text-zinc-400 dark:text-zinc-500" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* 4 Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                DNSSEC Status
              </p>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-950 dark:text-white">Enabled</span>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                SSL Certificate
              </p>
              <div className="flex items-center gap-1">
                <Lock className="size-3 text-cyan-600 dark:text-cyan-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-950 dark:text-white">Auto-TLS 1.3</span>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                Propagation
              </p>
              <div className="flex items-center gap-1">
                <Zap className="size-3 text-amber-600 dark:text-amber-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-950 dark:text-white">0.2ms Edge</span>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <p className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-0.5">
                Nameservers
              </p>
              <div className="flex items-center gap-1">
                <Wifi className="size-3 text-purple-600 dark:text-purple-400" />
                <span className="font-mono text-[10px] font-semibold text-zinc-950 dark:text-white">Multivrs Edge</span>
              </div>
            </div>
          </div>

          {/* DNS Records Table */}
          <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] font-semibold text-zinc-950 dark:text-white uppercase tracking-wider">
                DNS Routing Records
              </span>
              <span className="font-mono text-[8px] text-zinc-500 dark:text-zinc-400">4 Active</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded bg-zinc-100 dark:bg-white/[0.04] px-2 py-1 text-[9px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1 font-bold">A</span>
                  <span className="text-zinc-950 dark:text-white">@</span>
                </div>
                <span className="text-zinc-600 dark:text-zinc-400">76.76.21.21</span>
                <span className="text-emerald-600 dark:text-emerald-400">Proxied</span>
              </div>
              <div className="flex items-center justify-between rounded bg-zinc-100 dark:bg-white/[0.04] px-2 py-1 text-[9px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1 font-bold">CNAME</span>
                  <span className="text-zinc-950 dark:text-white">www</span>
                </div>
                <span className="text-zinc-600 dark:text-zinc-400">cname.multivrs.dev</span>
                <span className="text-emerald-600 dark:text-emerald-400">Proxied</span>
              </div>
              <div className="flex items-center justify-between rounded bg-zinc-100 dark:bg-white/[0.04] px-2 py-1 text-[9px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1 font-bold">MX</span>
                  <span className="text-zinc-950 dark:text-white">mail</span>
                </div>
                <span className="text-zinc-600 dark:text-zinc-400">mx.multivrs.net</span>
                <span className="text-zinc-500 dark:text-zinc-400">Priority 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-2xl bg-gradient-to-b from-transparent via-white/40 to-white dark:via-black/85 dark:to-black"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
