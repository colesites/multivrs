"use client";

import { Server, MoreHorizontal, ExternalLink, RefreshCw, Play, CheckCircle2, XCircle } from "lucide-react";
import { mockDeployments } from "@/lib/mock";
import { cn } from "@/lib/utils";

export default function DeploymentsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Deployments</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Review historical telemetry and build logs across your edge nodes.</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-border bg-card/40 backdrop-blur-3xl overflow-hidden relative shadow-2xl">
         <div className="absolute top-0 right-1/4 w-1/2 h-[300px] bg-blue-600/5 blur-[100px] -z-10 rounded-full" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] uppercase tracking-[0.2em] font-black bg-muted/30 text-muted-foreground/60 border-b border-border">
              <tr>
                <th className="px-8 py-5 font-black">Project</th>
                <th className="px-8 py-5 font-black">Status & Endpoint</th>
                <th className="px-8 py-5 font-black hidden lg:table-cell">Branch Path</th>
                <th className="px-8 py-5 font-black hidden md:table-cell">CPU Duration</th>
                <th className="px-8 py-5 font-black">Timestamp</th>
                <th className="px-8 py-5 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {mockDeployments.map((dep) => (
                <tr key={dep.id} className="group hover:bg-muted/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground border border-border group-hover:text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-300">
                        <Server className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-blue-500 transition-colors duration-300 text-base tracking-tight">{dep.project}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "relative flex h-2 w-2",
                          dep.status === "Ready" ? "text-emerald-500" : dep.status === "Building" ? "text-amber-500" : "text-rose-500"
                        )}>
                           {dep.status === "Building" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>}
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-current shadow-[0_0_10px_currentColor]"></span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.15em] border rounded-full px-2 py-0.5",
                           dep.status === "Ready" ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : 
                           dep.status === "Building" ? "text-amber-400 bg-amber-500/5 border-amber-500/10" : 
                           "text-rose-400 bg-rose-500/5 border-rose-500/10"
                        )}>{dep.status}</span>
                      </div>
                      <a href={`https://${dep.url}`} target="_blank" className="text-xs text-muted-foreground hover:text-blue-500 font-mono transition-colors flex items-center gap-1.5 w-max opacity-60 group-hover:opacity-100 italic">
                        {dep.url} <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell">
                    <span className="inline-flex items-center px-3 py-1 bg-muted/40 rounded-xl text-[11px] font-bold font-mono text-muted-foreground border border-border group-hover:bg-accent/50 group-hover:text-foreground transition-all duration-300">
                      /{dep.branch}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-muted-foreground/60 hidden md:table-cell font-mono text-xs font-bold">{dep.duration}</td>
                  <td className="px-8 py-6 text-muted-foreground/60 text-xs font-semibold">{dep.createdAt}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl border border-transparent hover:border-border transition-all">
                         <RefreshCw className="h-4 w-4" />
                       </button>
                       <button className="h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl border border-transparent hover:border-border transition-all">
                         <MoreHorizontal className="h-4 w-4" />
                       </button>
                    </div>
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

