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
      color: "text-emerald-600 dark:text-emerald-400",
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
      color: "text-cyan-600 dark:text-cyan-400",
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
      color: "text-purple-600 dark:text-purple-400",
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
      color: "text-amber-600 dark:text-amber-400",
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 border-b border-zinc-200 dark:border-white/10 pb-2.5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-0.5">
              Compute Architecture
            </p>
            <h4 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Zero Cold-Start Serverless Graph
            </h4>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>0.0ms Global Avg</span>
          </div>
        </div>

        {/* 2x2 Compute Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {nodes.map((node) => {
            const isSelected = activeNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`relative rounded-xl border p-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 hover:border-zinc-300 dark:hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-lg bg-zinc-200/70 dark:bg-white/5 ${node.color}`}>
                      <node.icon className="size-3.5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                      {node.title}
                    </span>
                  </div>
                  <span className="rounded bg-zinc-200/60 dark:bg-white/10 px-1.5 py-0.2 text-[8px] font-mono text-zinc-700 dark:text-zinc-300">
                    {node.badge}
                  </span>
                </div>
                <p className="text-[9px] text-zinc-600 dark:text-zinc-400 font-sans leading-tight mb-2">
                  {node.desc}
                </p>
                <div className="flex items-center justify-between text-[8.5px] font-mono pt-1.5 border-t border-zinc-200/80 dark:border-white/10 text-zinc-500 dark:text-zinc-400">
                  <span>Latency: <span className="text-zinc-950 dark:text-white font-semibold">{node.latency}</span></span>
                  <span>{node.memory}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Node Detail Bar */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/60 p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-300">
              Active Runtime: <span className="text-zinc-950 dark:text-white font-semibold">{selectedNode.title}</span> ({selectedNode.memory})
            </span>
          </div>
          <span className="font-mono text-[9px] text-purple-600 dark:text-purple-400">
            Telemetry Live
          </span>
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
