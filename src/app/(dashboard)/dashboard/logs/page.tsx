"use client";

import { TerminalSquare, Filter, Play, CircleSlash, Download } from "lucide-react";
import { mockLogs } from "@/lib/mock";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  return (
    <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Realtime Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">Live telemetry and build events streams.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex bg-muted/30 backdrop-blur-md rounded-xl p-1 border border-border">
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-accent text-foreground shadow-sm">
                    <Play className="h-3 w-3 text-emerald-400 fill-emerald-400/20" />
                    Live
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                    <CircleSlash className="h-3 w-3" />
                    Paused
                </button>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-accent/20 border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/40 transition-all">
                <Filter className="h-4 w-4" />
                Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-accent/20 border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/40 transition-all">
                <Download className="h-4 w-4" />
                Export
            </button>
        </div>
      </div>

      <div className="flex-1 rounded-[32px] border border-border bg-background/90 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col relative ring-1 ring-border/50">
         {/* Terminal Header */}
         <div className="flex h-12 shrink-0 items-center px-6 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/20 ring-1 ring-rose-500/50" />
                <div className="h-3 w-3 rounded-full bg-amber-500/20 ring-1 ring-amber-500/50" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/50" />
            </div>
            <div className="mx-auto flex items-center gap-2 opacity-50">
               <TerminalSquare className="h-4 w-4" />
               <span className="text-xs font-mono tracking-widest uppercase">multivrs-edge-stream</span>
            </div>
         </div>
         
         {/* Logs Output */}
         <div className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed">
            <div className="space-y-4">
                <div className="text-muted-foreground mb-8 text-xs border-b border-white/5 pb-4">
                    [SYSTEM] Connected to wss://logs.multivrs.space/stream<br/>
                    [SYSTEM] Authenticated as MULTIVRS ORG<br/>
                    [SYSTEM] Awaiting new events...
                </div>

                 {mockLogs.map((log) => (
                    <div key={log.id} className="flex flex-col sm:flex-row sm:items-start gap-4 py-1 hover:bg-accent/30 rounded-md px-2 -mx-2 transition-colors">
                        <div className="flex items-center gap-4 shrink-0 sm:w-48">
                            <span className="text-muted-foreground/60 text-xs">{log.timestamp}</span>
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                                log.level === "INFO" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                log.level === "WARN" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {log.level}
                            </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                           <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded truncate shrink-0 max-w-[150px] border border-border/30">{log.service}</span>
                           <span className={cn(
                               "truncate text-sm font-medium",
                               log.level === "ERROR" ? "text-destructive/90" : "text-foreground/90"
                           )}>{log.message}</span>
                        </div>
                    </div>
                ))}
            </div>
         </div>
      </div>
    </div>
  );
}
