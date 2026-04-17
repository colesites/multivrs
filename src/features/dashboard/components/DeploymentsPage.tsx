"use client";

import { ListFilter } from "lucide-react";
import { mockDeployments } from "@/lib/mock";
import { DeploymentCard } from "./DeploymentCard";

export function DeploymentsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Deployments</h2>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">Review historical telemetry and build logs across your edge nodes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-[14px] bg-white/3 border border-white/6 px-4 py-2.5 text-[12px] font-bold text-foreground hover:bg-white/8 transition-colors shadow-sm">
            <ListFilter className="h-3.5 w-3.5 opacity-70" /> Filter
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/6 bg-background relative overflow-hidden card-grain inner-glow shadow-2xl" style={{ "--glow-color": "rgba(59, 130, 246, 0.05)" } as React.CSSProperties}>
         {/* Background ambient glow */}
         <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/3 blur-[100px] -z-10 rounded-full pointer-events-none" />

         <div className="flex items-center justify-between border-b border-white/4 px-6 py-4 bg-white/1">
            <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">Pipeline History</span>
         </div>

         {/* Pipeline Feed */}
         <div className="flex flex-col relative z-10 p-2">
            {mockDeployments.map((dep, index) => (
              <DeploymentCard 
                key={dep.id} 
                deployment={dep} 
                isLast={index === mockDeployments.length - 1} 
              />
            ))}
         </div>
      </div>
    </div>
  );
}
