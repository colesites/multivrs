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
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-4 sm:p-5 shadow-2xl backdrop-blur-xl overflow-hidden text-white"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 70%, rgba(0,0,0,0.65) 86%, rgba(0,0,0,0.1) 96%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 70%, rgba(0,0,0,0.65) 86%, rgba(0,0,0,0.1) 96%, transparent 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 border-b border-white/10 pb-2.5">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 mb-0.5">
              Compute Architecture
            </p>
            <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Zero Cold-Start Serverless Graph
            </h4>
          </div>
          <div className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>0.00ms Cold Start</span>
          </div>
        </div>

        {/* 4 Serverless Edge Compute Nodes in clean 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {nodes.map((node) => {
            const isSelected = activeNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`group flex items-center justify-between rounded-xl p-2.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-white/[0.08] border-white/20 shadow-md ring-1 ring-white/10"
                    : "bg-zinc-950/60 border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg border ${
                      isSelected
                        ? "bg-white text-black border-white"
                        : "bg-zinc-900 border-white/10 text-zinc-400"
                    }`}
                  >
                    <node.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans text-xs font-semibold text-white truncate">
                        {node.title}
                      </span>
                    </div>
                    <p className="font-mono text-[9px] text-zinc-400">
                      {node.memory} · {node.latency}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[9px] text-emerald-400">
                  {node.status}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Box */}
        <div className="rounded-xl border border-white/10 bg-zinc-950/80 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[8.5px] uppercase tracking-wider text-zinc-400">
              Active Runtime Trace
            </span>
            <span className="font-mono text-[9.5px] font-bold text-emerald-400">
              {selectedNode.latency} TTFB
            </span>
          </div>
          <p className="text-[11px] font-semibold text-white mb-0.5">
            {selectedNode.title}
          </p>
          <p className="text-[9.5px] text-zinc-400 font-sans leading-tight">
            {selectedNode.desc}
          </p>
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
