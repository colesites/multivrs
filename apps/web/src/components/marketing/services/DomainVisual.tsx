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
            "radial-gradient(ellipse 90% 75% at 50% 25%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
        aria-hidden="true"
      />

      {/* Main card replicating the Domain detail dashboard */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-3 sm:p-4 shadow-2xl backdrop-blur-xl overflow-hidden flex gap-3 text-white"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 68%, rgba(0,0,0,0.65) 84%, rgba(0,0,0,0.1) 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 68%, rgba(0,0,0,0.65) 84%, rgba(0,0,0,0.1) 96%, transparent 100%)",
        }}
      >
        {/* Left Sidebar */}
        <div className="hidden sm:flex flex-col w-32 shrink-0 border-r border-white/10 pr-2">
          {/* User info */}
          <div className="flex items-center gap-1.5 px-1 pb-2 mb-1.5 border-b border-white/10">
            <div className="grid size-4.5 place-items-center rounded bg-zinc-800 font-mono text-[8px] font-bold text-white">
              C
            </div>
            <span className="font-mono text-[9.5px] text-zinc-300">ctech</span>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-1 rounded-md border border-white/10 bg-zinc-950 px-1.5 py-0.5 mb-1.5 text-[9px] text-zinc-400 focus-within:border-white/30 transition-colors">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <Search className="size-2.5 text-zinc-500 shrink-0" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[9px] text-white placeholder:text-zinc-500 outline-none"
              />
            </div>
            <span className="font-mono text-[7px] text-zinc-500 bg-white/5 px-1 py-0.2 rounded border border-white/5 shrink-0">
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
                      ? "bg-white/[0.08] text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-0.5 rounded-r bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <item.icon className={`size-3 shrink-0 ${isActive ? "text-white" : "text-zinc-500"}`} />
                    <span className="text-[10px] truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="font-mono text-[7px] text-purple-400/80 bg-purple-500/10 px-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Top Breadcrumb Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-[10.5px] text-zinc-400 font-sans">
              <span className="text-zinc-300">All Projects</span>
              <span className="text-zinc-600">›</span>
              <span className="text-white font-medium">Domains</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
              <span>Domains</span>
              <span>/</span>
              <span className="text-zinc-300">test.com</span>
              <Copy className="size-2.5 ml-1 text-zinc-500 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Domain Title Header */}
          <div className="mb-3">
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-0.5">
              test.com
            </h4>
            <p className="text-[11px] text-zinc-400 font-sans">
              Registered and managed by Multivrs
            </p>
          </div>

          {/* Metadata Row Panel (4 Columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-white/10 bg-zinc-950/80 p-2.5 mb-2.5 text-[10px]">
            <div>
              <span className="text-zinc-500 block mb-0.5">Expiration</span>
              <span className="text-white font-mono flex items-center gap-1">
                <RefreshCw className="size-2.5 text-zinc-400" />
                Jul 24, 2027
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Auto renewal</span>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-medium">{autoRenew ? "On" : "Off"}</span>
                <button
                  type="button"
                  onClick={() => setAutoRenew(!autoRenew)}
                  className={`relative inline-flex h-3 w-5 items-center rounded-full transition-colors ${
                    autoRenew ? "bg-[#A855F7]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block size-2 transform rounded-full bg-white transition-transform ${
                      autoRenew ? "translate-x-2.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Registrar</span>
              <span className="text-white font-medium">Multivrs</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5">Nameservers</span>
              <span className="text-white font-medium">Anycast Edge</span>
            </div>
          </div>

          {/* Connected Project Section */}
          <div className="mb-2.5">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 text-zinc-400" />
                <div>
                  <span className="font-mono text-xs font-semibold text-white">test.com</span>
                  <span className="text-[9.5px] text-zinc-500 ml-2">Routes to hull-superstore</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                hull-superstore
              </span>
            </div>
          </div>

          {/* Bottom Split Cards: Nameservers + TLS Certificate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Nameservers Card */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[10px] text-zinc-400 font-semibold">
                <Server className="size-3 text-zinc-400" />
                <span>Nameservers</span>
              </div>
              <div className="space-y-0.5 font-mono text-[9px] text-zinc-300">
                <div>ns1.multivrs.com · ns2.multivrs.com</div>
              </div>
              <p className="text-[8px] text-emerald-400/90 mt-1 font-sans">Delegation active & healthy.</p>
            </div>

            {/* TLS Certificate Card */}
            <div className="rounded-xl border border-white/10 bg-zinc-950/60 p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[10px] text-zinc-400 font-semibold">
                <Lock className="size-3 text-zinc-400" />
                <span>TLS Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                <p className="text-[9.5px] font-medium text-white">Active & Auto-Renewed</p>
              </div>
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
