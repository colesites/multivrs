"use client";

import { Plus } from "lucide-react";
import { mockDomains } from "@/lib/mock";
import { DomainRow } from "./DomainRow";

export function DomainsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Domains</h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Manage custom domains and automated SSL certificates at the edge.</p>
        </div>
        <button className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background hover:bg-foreground/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add Domain
        </button>
      </div>

      {/* Grid Container */}
      <div className="rounded-[32px] border border-white/6 bg-background relative overflow-hidden card-grain inner-glow shadow-2xl" style={{ "--glow-color": "rgba(59, 130, 246, 0.08)" } as React.CSSProperties}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-1/2 h-[200px] bg-blue-600/3 blur-[80px] -z-10 rounded-full" />

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-white/4 p-3 bg-white/1">
           <div className="flex gap-2 items-center px-2">
              <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">Active ({mockDomains.filter(d => d.status === "Verified").length})</span>
           </div>
           {/* Placeholder for future domain search/filters */}
        </div>

        {/* Rows */}
        <div className="flex flex-col relative z-10">
          {mockDomains.map((domain) => (
            <DomainRow key={domain.id} domain={domain} />
          ))}
        </div>
      </div>
    </div>
  );
}
