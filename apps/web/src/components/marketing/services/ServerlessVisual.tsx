"use client";

import { useState } from "react";
import {
  Zap,
  Lock,
  Globe2,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
} from "lucide-react";

export function ServerlessVisual() {
  const [activeNode, setActiveNode] = useState<string>("auth");

  const nodes = [
    {
      id: "auth",
      title: "Edge Authentication",
      desc: "Zero-latency JWT verification & rate-limiting before reaching origin",
      icon: Lock,
      latency: "0.4ms",
      memory: "128MB isolate",
      status: "Active",
      color: "text-emerald-400",
      badge: "Isolate",
    },
    {
      id: "routing",
      title: "Dynamic Geo-Routing",
      desc: "Smart edge traffic steering & localized asset dispatch",
      icon: Globe2,
      latency: "0.2ms",
      memory: "64MB isolate",
      status: "Active",
      color: "text-cyan-400",
      badge: "Anycast",
    },
    {
      id: "compute",
      title: "WASM / SSR Micro-Engine",
      desc: "Instant serverless execution in Swift, Rust, or Node with 0ms cold starts",
      icon: Cpu,
      latency: "1.1ms",
      memory: "512MB isolate",
      status: "Active",
      color: "text-purple-400",
      badge: "V8 & WASM",
    },
    {
      id: "state",
      title: "Distributed Edge State",
      desc: "Sub-millisecond key-value storage and transactional durable objects",
      icon: Database,
      latency: "0.8ms",
      memory: "Global KV",
      status: "Synced",
      color: "text-amber-400",
      badge: "Storage",
    },
  ];

  const selectedNode = nodes.find((n) => n.id === activeNode) || nodes[0]!;

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
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-6 sm:p-7 shadow-2xl backdrop-blur-xl overflow-hidden text-white"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 60%, rgba(0,0,0,0.65) 80%, rgba(0,0,0,0.1) 94%, transparent 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1">
              Compute Architecture
            </p>
            <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Zero Cold-Start Serverless Graph
            </h4>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>0.00ms Cold Start</span>
          </div>
        </div>

        {/* Interactive Architecture Graph */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6 relative">
          {/* Left: Client Request Origin */}
          <div className="md:col-span-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex size-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  Incoming Request
                </span>
              </div>
              <p className="font-mono text-xs font-semibold text-white mb-1">
                GET /api/v2/render
              </p>
              <div className="space-y-1 font-mono text-[9px] text-zinc-500">
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span className="text-zinc-300">HTTP/3 (QUIC)</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge PoP:</span>
                  <span className="text-zinc-300">iad1 (US-East)</span>
                </div>
                <div className="flex justify-between">
                  <span>TLS Handshake:</span>
                  <span className="text-emerald-400">0.8ms</span>
                </div>
              </div>
            </div>

            {/* Selected Node Details Box */}
            <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                  Active Runtime Trace
                </span>
                <span className="font-mono text-[10px] font-bold text-white">
                  {selectedNode.latency}
                </span>
              </div>
              <p className="text-xs font-semibold text-white mb-1">
                {selectedNode.title}
              </p>
              <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mb-2">
                {selectedNode.desc}
              </p>
              <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500 pt-2 border-t border-white/10">
                <span>Allocation: {selectedNode.memory}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-2.5" />
                  {selectedNode.status}
                </span>
              </div>
            </div>
          </div>

          {/* Center-Right: Serverless Edge Compute Nodes */}
          <div className="md:col-span-8 space-y-2.5 relative">
            {/* SVG Connecting Wire Lines */}
            <svg
              className="absolute -left-6 inset-y-0 w-8 h-full pointer-events-none hidden md:block opacity-40"
              viewBox="0 0 32 200"
              fill="none"
            >
              <path
                d="M 0 100 C 16 100, 16 25, 32 25"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <path
                d="M 0 100 C 16 100, 16 75, 32 75"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M 0 100 C 16 100, 16 125, 32 125"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M 0 100 C 16 100, 16 175, 32 175"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            </svg>

            {nodes.map((node) => {
              const isSelected = activeNode === node.id;
              const Icon = node.icon;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNode(node.id)}
                  className={`group relative flex items-center justify-between rounded-xl px-4 py-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-white/30 bg-white/[0.08] shadow-lg translate-x-1"
                      : "border-white/10 bg-zinc-950/70 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isSelected
                          ? "border-white/30 bg-white text-black"
                          : "border-white/10 bg-zinc-900 text-zinc-400 group-hover:text-white"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs font-semibold text-white truncate">
                          {node.title}
                        </span>
                        <span className="font-mono text-[8.5px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                          {node.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate font-sans">
                        {node.desc}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3 font-mono">
                    <span className="text-xs font-bold text-white block">
                      {node.latency}
                    </span>
                    <span className="text-[9px] text-emerald-400">verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Performance Summary Bar */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center font-mono text-[10px]">
          <div className="rounded-lg bg-zinc-950 p-2 border border-white/5">
            <span className="text-zinc-500 block mb-0.5">Total Execution</span>
            <span className="text-white font-bold text-xs">2.5ms TTFB</span>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2 border border-white/5">
            <span className="text-zinc-500 block mb-0.5">Global Locations</span>
            <span className="text-white font-bold text-xs">310+ Edge PoPs</span>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2 border border-white/5">
            <span className="text-zinc-500 block mb-0.5">Compute Cost</span>
            <span className="text-emerald-400 font-bold text-xs">$0.00 At-Cost</span>
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
