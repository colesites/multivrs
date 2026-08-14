"use client";

import { useState } from "react";
import {
  Inbox,
  Send,
  FileText,
  Clock,
  ShieldAlert,
  Trash2,
  Mail,
  Users,
  Settings,
  Activity,
  ArrowUpRight,
  Radio,
  Share2,
  Lock,
  Layers,
  Search,
  Plus,
  Star,
  Archive,
  MousePointerClick,
  CheckCircle2,
} from "lucide-react";

export function MailboxVisual() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarNav = [
    { name: "Overview", icon: Activity, active: true },
    { name: "Inbox", icon: Inbox },
    { name: "Sent", icon: Send },
    { name: "Drafts", icon: FileText },
    { name: "Analytics", icon: Radio },
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

      {/* Main card replicating the Dashboard Email screen */}
      <div
        className="relative rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#000000] p-3 sm:p-4 shadow-xl dark:shadow-2xl backdrop-blur-xl overflow-hidden flex gap-3 text-zinc-900 dark:text-white transition-colors"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
        }}
      >
        {/* Left Sidebar */}
        <div className="hidden sm:flex flex-col w-36 shrink-0 border-r border-zinc-200 dark:border-white/10 pr-2.5">
          {/* User / Back header */}
          <div className="flex items-center gap-1.5 px-1 pb-2 mb-1 border-b border-zinc-200 dark:border-white/10">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans">← Email</span>
          </div>

          {/* Compose Button */}
          <button
            type="button"
            className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-2.5 py-1 text-xs font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <span>Compose</span>
          </button>

          {/* Core Folders */}
          <div className="space-y-0.5 text-xs mb-3">
            {sidebarNav.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-zinc-100 dark:bg-white/[0.08] text-zinc-950 dark:text-white font-medium shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-white/[0.03]"
                  }`}
                >
                  <item.icon className="size-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-[10.5px] font-sans">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Detail Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Top Search & Actions Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-white/10 pb-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-600 dark:text-zinc-300">All Projects</span>
              <span>›</span>
              <span className="text-zinc-950 dark:text-white font-semibold">Emails</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 text-[9px] text-zinc-500 dark:text-zinc-400 focus-within:border-zinc-400 dark:focus-within:border-white/30">
                <Search className="size-2.5" />
                <input
                  type="text"
                  placeholder="Search mail and resources..."
                  className="bg-transparent text-[9px] text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none w-32"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md bg-zinc-900 dark:bg-white px-2 py-0.5 text-[9px] font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                <Plus className="size-2.5" />
                <span>Compose</span>
              </button>
            </div>
          </div>

          {/* Email Feature Hero Banner */}
          <div className="rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-zinc-50 dark:via-zinc-950 to-transparent p-3 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-mono text-[8px] uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold mb-0.5">
                Communications Control Plane
              </p>
              <h5 className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white tracking-tight mb-1">
                One mailbox for product mail, support conversations, and campaigns.
              </h5>
              <p className="text-[9px] text-zinc-600 dark:text-zinc-400 font-sans leading-tight">
                Incoming and outgoing mail share a real thread model with authenticated DKIM & SPF delivery.
              </p>
            </div>
          </div>

          {/* Compact 4 Metrics Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 mb-1">
                <Send className="size-3" />
              </div>
              <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">142,850</p>
              <p className="font-sans text-[8.5px] text-zinc-500 dark:text-zinc-400">Sent this month</p>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 mb-1">
                <Inbox className="size-3" />
              </div>
              <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">28,490</p>
              <p className="font-sans text-[8.5px] text-zinc-500 dark:text-zinc-400">Received</p>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="size-3" />
              </div>
              <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">99.98%</p>
              <p className="font-sans text-[8.5px] text-zinc-500 dark:text-zinc-400">Delivery rate</p>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 mb-1">
                <MousePointerClick className="size-3" />
              </div>
              <p className="font-mono text-sm font-bold text-zinc-950 dark:text-white">64.2%</p>
              <p className="font-sans text-[8.5px] text-zinc-500 dark:text-zinc-400">Open rate</p>
            </div>
          </div>

          {/* Recent Conversations List */}
          <div className="rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] font-semibold text-zinc-950 dark:text-white uppercase tracking-wider">
                Recent conversations
              </span>
              <span className="font-mono text-[8px] text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                <span>Open inbox</span>
                <ArrowUpRight className="size-2" />
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between rounded bg-zinc-100 dark:bg-white/[0.04] p-1.5 text-[9px]">
                <div className="flex items-center gap-2">
                  <div className="size-4.5 rounded bg-zinc-200 dark:bg-zinc-800 grid place-items-center font-mono text-[8px] text-zinc-900 dark:text-white">LN</div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white font-sans">Linear Security</p>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 truncate">New personal API key generated</p>
                  </div>
                </div>
                <span className="font-mono text-[7.5px] text-zinc-400 dark:text-zinc-500">2m ago</span>
              </div>
              <div className="flex items-center justify-between rounded bg-zinc-100 dark:bg-white/[0.04] p-1.5 text-[9px]">
                <div className="flex items-center gap-2">
                  <div className="size-4.5 rounded bg-zinc-200 dark:bg-zinc-800 grid place-items-center font-mono text-[8px] text-zinc-900 dark:text-white">GH</div>
                  <div>
                    <p className="font-semibold text-zinc-950 dark:text-white font-sans">GitHub Deploy</p>
                    <p className="text-[8px] text-zinc-500 dark:text-zinc-400 truncate">[multivrs/core] Release v2.4.0 success</p>
                  </div>
                </div>
                <span className="font-mono text-[7.5px] text-zinc-400 dark:text-zinc-500">14m ago</span>
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
