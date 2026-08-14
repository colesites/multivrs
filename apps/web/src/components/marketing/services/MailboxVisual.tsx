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
    { name: "Starred", icon: Star },
    { name: "Sent", icon: Send },
    { name: "Drafts", icon: FileText },
    { name: "Archive", icon: Archive },
    { name: "Spam", icon: ShieldAlert },
    { name: "Trash", icon: Trash2 },
  ];

  const sendAndScale = [
    { name: "Email logs", icon: Mail },
    { name: "Broadcasts", icon: Radio },
    { name: "Automations", icon: Layers },
    { name: "Templates", icon: FileText },
    { name: "Contacts", icon: Users },
    { name: "Audiences", icon: Users },
  ];

  const infrastructure = [
    { name: "Domains", icon: Share2 },
    { name: "Mailboxes", icon: Inbox },
    { name: "API & SMTP", icon: Lock },
    { name: "Webhooks", icon: Activity },
    { name: "Analytics", icon: Activity },
    { name: "Settings", icon: Settings },
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

      {/* Main card replicating the Dashboard Email screen */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-3 sm:p-4 shadow-2xl backdrop-blur-xl overflow-hidden flex gap-3 text-white"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
        }}
      >
        {/* Left Sidebar */}
        <div className="hidden sm:flex flex-col w-36 shrink-0 border-r border-white/10 pr-2.5">
          {/* User / Back header */}
          <div className="flex items-center gap-1.5 px-1 pb-2 mb-1 border-b border-white/10">
            <span className="text-[10px] text-zinc-400 font-sans">← Email</span>
          </div>

          {/* Big White Compose Button */}
          <button
            type="button"
            className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors shadow-sm"
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
                  className={`relative w-full flex items-center gap-2 px-2 py-1 rounded-md text-left transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                  <item.icon className="size-3 text-zinc-400" />
                  <span className="text-[11px]">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* SEND & SCALE */}
          <div className="border-t border-white/10 pt-2 mb-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-500 px-1 mb-1">
              Send & Scale
            </p>
            <div className="space-y-0.5 text-xs text-zinc-400">
              {sendAndScale.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2 py-0.5 rounded text-[11px] hover:text-zinc-200 cursor-pointer"
                >
                  <item.icon className="size-3 text-zinc-500" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* INFRASTRUCTURE */}
          <div className="border-t border-white/10 pt-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-zinc-500 px-1 mb-1">
              Infrastructure
            </p>
            <div className="space-y-0.5 text-xs text-zinc-400">
              {infrastructure.slice(0, 3).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 px-2 py-0.5 rounded text-[11px] hover:text-zinc-200 cursor-pointer"
                >
                  <item.icon className="size-3 text-zinc-500" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Control Plane Area */}
        <div className="flex-1 min-w-0">
          {/* Top Bar Header with Interactive Search Input */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 gap-2">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-sans shrink-0">
              <span className="text-zinc-300">All Projects</span>
              <span className="text-zinc-600">›</span>
              <span className="text-white font-medium">Emails</span>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end max-w-xs">
              <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-[10px] text-zinc-400 focus-within:border-white/30 transition-colors w-full">
                <Search className="size-3 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search mail and resources..."
                  className="w-full bg-transparent text-[10px] text-white placeholder:text-zinc-500 outline-none"
                />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-black hover:bg-zinc-200 transition-colors shrink-0"
              >
                <Plus className="size-3" />
                <span>Compose</span>
              </button>
            </div>
          </div>

          {/* Hero Banner with Communications Control Plane */}
          <div
            className="relative overflow-hidden rounded-xl border border-white/10 bg-black p-4 mb-3"
            style={{
              backgroundImage:
                "radial-gradient(circle at 10% 0%, rgba(168, 85, 247, 0.12), transparent 40%), linear-gradient(130deg, rgba(255,255,255,0.02), rgba(0,0,0,0.8))",
            }}
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#A855F7] mb-1">
              Communications control plane
            </p>
            <h4 className="text-base sm:text-lg font-medium tracking-tight text-white mb-1 leading-snug">
              One mailbox for product mail, support conversations, and campaigns.
            </h4>
            <p className="text-[11px] leading-relaxed text-zinc-400 font-sans line-clamp-2">
              Incoming and outgoing mail share a real thread model. Delivery states come from provider events—not optimistic UI.
            </p>
          </div>

          {/* 4 Metric Stats Cards with Non-Zero Production Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 mb-3">
            <div className="bg-black p-3">
              <Send className="size-3 text-[#A855F7]" />
              <p className="mt-2.5 font-sans text-lg font-medium tracking-tight text-white">142,850</p>
              <p className="text-[9px] text-zinc-400 font-sans">Sent this month</p>
            </div>

            <div className="bg-black p-3">
              <Inbox className="size-3 text-[#A855F7]" />
              <p className="mt-2.5 font-sans text-lg font-medium tracking-tight text-white">28,490</p>
              <p className="text-[9px] text-zinc-400 font-sans">Received</p>
            </div>

            <div className="bg-black p-3">
              <Clock className="size-3 text-[#A855F7]" />
              <p className="mt-2.5 font-sans text-lg font-medium tracking-tight text-white">99.98%</p>
              <p className="text-[9px] text-zinc-400 font-sans">Delivery rate</p>
            </div>

            <div className="bg-black p-3">
              <MousePointerClick className="size-3 text-[#A855F7]" />
              <p className="mt-2.5 font-sans text-lg font-medium tracking-tight text-white">64.2%</p>
              <p className="text-[9px] text-zinc-400 font-sans">Open rate</p>
            </div>
          </div>

          {/* Split Bottom Cards: Recent Conversations + Infrastructure */}
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3">
            {/* Recent Conversations Card */}
            <div className="rounded-xl border border-white/10 bg-black p-3.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <div>
                  <h5 className="text-xs font-medium text-white">Recent conversations</h5>
                  <p className="text-[10px] text-zinc-400 font-sans">The latest activity across every mailbox.</p>
                </div>
                <span className="flex items-center gap-1 font-sans text-[10px] text-[#A855F7] hover:underline cursor-pointer">
                  Open inbox <ArrowUpRight className="size-2.5" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 font-mono text-[9px] font-bold text-white">
                      LN
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-medium text-white truncate">Linear</span>
                        <span className="font-mono text-[8px] text-purple-300 bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">
                          Security
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-sans">
                        New personal API key generated for workspace
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 shrink-0 ml-2">2m ago</span>
                </div>

                <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 font-mono text-[9px] font-bold text-white">
                      GH
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-medium text-white truncate">GitHub</span>
                        <span className="font-mono text-[8px] text-purple-300 bg-purple-500/10 px-1 py-0.2 rounded border border-purple-500/20">
                          Deploy
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-sans">
                        [multivrs/core] Release v2.4.0 deployed successfully
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 shrink-0 ml-2">14m ago</span>
                </div>

                <div className="flex items-center justify-between rounded-lg p-1.5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 font-mono text-[9px] font-bold text-white">
                      SB
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-medium text-white truncate">Stripe</span>
                        <span className="font-mono text-[8px] text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                          Paid
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-sans">
                        Receipt for Invoice #INV-2026-8849 ($420.00)
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 shrink-0 ml-2">1h ago</span>
                </div>
              </div>
            </div>

            {/* Infrastructure Card with Realistic Numbers */}
            <div className="rounded-xl border border-white/10 bg-black p-3.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400 mb-3">
                Infrastructure
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
                  <span className="text-zinc-400">Active mailboxes</span>
                  <span className="font-mono text-white">8</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px]">
                  <span className="text-zinc-400">Verified domains</span>
                  <span className="font-mono text-white">3</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Contacts</span>
                  <span className="font-mono text-white">24,500</span>
                </div>
              </div>
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
