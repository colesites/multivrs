"use client";

import { Server, ExternalLink, RefreshCw, MoreHorizontal, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeploymentProps {
  deployment: {
    id: string;
    project: string;
    status: string;
    branch: string;
    duration: string;
    url: string;
    createdAt: string;
  };
  isLast?: boolean;
}

export function DeploymentCard({ deployment, isLast }: DeploymentProps) {
  const isBuilding = deployment.status === "Building";
  const isReady = deployment.status === "Ready";
  const isError = deployment.status === "Failed";

  return (
    <div className="flex relative group">
       {/* Timeline Line */}
       {!isLast && (
         <div className="absolute left-8 top-16 bottom-0 w-px bg-white/5 group-hover:bg-white/10 transition-colors">
            {isBuilding && (
              <div className="absolute top-0 left-0 w-full h-[50%] bg-linear-to-b from-transparent via-blue-500/50 to-transparent animate-pulse" />
            )}
         </div>
       )}

       {/* Status Node */}
       <div className="relative z-10 w-16 shrink-0 flex justify-center pt-6">
         <div className={cn(
           "flex h-8 w-8 items-center justify-center rounded-xl bg-background border shadow-xl relative",
           isReady ? "border-emerald-500/30 text-emerald-400" :
           isBuilding ? "border-amber-500/30 text-amber-400 bg-amber-500/5" :
           "border-rose-500/30 text-rose-400"
         )}>
           {isBuilding && <span className="animate-ping absolute inline-flex h-full w-full rounded-xl opacity-40 bg-amber-400"></span>}
           <Server className="h-3.5 w-3.5" />
         </div>
       </div>

       {/* Card Content */}
       <div className="flex-1 pb-6 pt-5 pr-5 min-w-0">
          <div className="rounded-[24px] border border-white/6 bg-background relative overflow-hidden card-grain transition-all duration-500 hover:border-white/10 group-hover:bg-white/1.5 p-5 shadow-sm">
             {/* Inner ambient glow for Building states */}
             {isBuilding && (
                <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 pulse-subtle -z-10" />
             )}

             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-2">
                     <h3 className="font-bold text-foreground tracking-tight truncate text-[15px]">{deployment.project}</h3>
                     <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border",
                        isReady ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        isBuilding ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-rose-400 bg-rose-500/10 border-rose-500/20"
                     )}>
                        {deployment.status}
                     </span>
                   </div>

                   <div className="flex items-center gap-4 text-[12px] mt-2">
                       <span className="flex items-center gap-1.5 text-muted-foreground/80 font-medium">
                         <GitBranch className="h-3.5 w-3.5" /> {deployment.branch}
                       </span>
                       <span className="text-white/20">•</span>
                       <span className="text-muted-foreground/60 font-mono tracking-widest font-semibold">{deployment.duration}</span>
                   </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 mt-3 sm:mt-0">
                   {/* Endpoint Dropdown */}
                   <a 
                     href={`https://${deployment.url}`} 
                     target="_blank" 
                     className="hidden md:flex items-center gap-1.5 text-[11px] font-bold font-mono tracking-wide text-muted-foreground bg-white/3 hover:bg-white/6 hover:text-blue-400 transition-all border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-[10px]"
                   >
                     {deployment.url} <ExternalLink className="h-3 w-3" />
                   </a>

                   <div className="flex items-center gap-2">
                      <button className="h-8 w-8 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/5 rounded-[10px] border border-transparent hover:border-white/10 transition-all">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-white/5 rounded-[10px] border border-transparent hover:border-white/10 transition-all">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px] rounded-[16px] bg-background/95 backdrop-blur-xl border-white/10 card-grain">
                          <DropdownMenuItem className="text-[12px] font-bold text-foreground focus:bg-white/5 cursor-pointer rounded-xl">View Logs</DropdownMenuItem>
                          <DropdownMenuItem className="text-[12px] font-bold text-foreground focus:bg-white/5 cursor-pointer rounded-xl">Copy URL</DropdownMenuItem>
                          <DropdownMenuItem className="text-[12px] font-bold text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer rounded-xl mt-1">Cancel Build</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
