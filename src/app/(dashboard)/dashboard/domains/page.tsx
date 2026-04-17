"use client";

import { Globe, Plus, ShieldCheck, AlertCircle, ExternalLink, MoreVertical } from "lucide-react";
import { mockDomains } from "@/lib/mock";
import { cn } from "@/lib/utils";

export default function DomainsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Domains</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Manage custom domains and automated SSL certificates at the edge.</p>
        </div>
        <button className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background hover:bg-foreground/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
          <Plus className="h-4 w-4 stroke-[3px]" />
          Add Domain
        </button>
      </div>

      <div className="rounded-[28px] border border-border bg-background relative overflow-hidden card-grain inner-glow shadow-2xl" style={{ "--glow-color": "rgba(59, 130, 246, 0.08)" } as React.CSSProperties}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-1/2 h-[200px] bg-blue-600/[0.03] blur-[80px] -z-10 rounded-full" />

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] uppercase tracking-[0.2em] font-bold bg-white/[0.02] text-muted-foreground/50 border-b border-white/[0.05]">
              <tr>
                <th className="px-7 py-5 font-bold">Domain</th>
                <th className="px-7 py-5 font-bold">Project</th>
                <th className="px-7 py-5 font-bold">Status</th>
                <th className="px-7 py-5 font-bold hidden md:table-cell">SSL</th>
                <th className="px-7 py-5 font-bold hidden lg:table-cell">Added</th>
                <th className="px-7 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {mockDomains.map((domain) => (
                <tr key={domain.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                  {/* Domain Name */}
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/15 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all duration-300">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={`https://${domain.name}`}
                          target="_blank"
                          className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 tracking-tight"
                        >
                          {domain.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Project */}
                  <td className="px-7 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 bg-white/[0.03] rounded-lg text-[11px] font-bold font-mono text-muted-foreground/60 border border-white/[0.05] group-hover:text-foreground/70 group-hover:bg-white/[0.06] transition-all duration-300">
                      {domain.project}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-7 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("relative flex h-1.5 w-1.5", domain.status === "Verified" ? "text-emerald-500" : "text-amber-500")}>
                        <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5 bg-current shadow-[0_0_8px_currentColor]")} />
                      </div>
                      {domain.status === "Verified" ? (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.12em] bg-emerald-500/8 border border-emerald-500/15 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                          <ShieldCheck className="h-3 w-3" />
                          {domain.status}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.12em] bg-amber-500/8 border border-amber-500/15 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                          <AlertCircle className="h-3 w-3" />
                          {domain.status}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* SSL */}
                  <td className="px-7 py-5 hidden md:table-cell">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.12em] bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-0.5",
                      domain.ssl === "Active" ? "text-foreground/60" : "text-amber-400"
                    )}>
                      {domain.ssl}
                    </span>
                  </td>

                  {/* Added */}
                  <td className="px-7 py-5 text-muted-foreground/40 text-xs font-medium hidden lg:table-cell">
                    {domain.addedAt}
                  </td>

                  {/* Actions */}
                  <td className="px-7 py-5 text-right">
                    <button className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground/40 hover:text-foreground hover:bg-white/[0.05] rounded-lg border border-transparent hover:border-white/[0.08] transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
