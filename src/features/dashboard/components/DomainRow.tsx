"use client";

import { Globe, ShieldCheck, AlertCircle, ExternalLink, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DomainProps {
  domain: {
    id: string;
    name: string;
    project: string;
    status: string;
    ssl: string;
    addedAt: string;
  };
}

export function DomainRow({ domain }: DomainProps) {
  const isVerified = domain.status === "Verified";
  const sslActive = domain.ssl === "Active";

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-white/2 transition-colors duration-300 border-b border-white/4 last:border-0 relative">
      {/* Glow on hover */}
      <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-blue-500/0 group-hover:via-blue-500/20 to-transparent transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] pointer-events-none" />

      <div className="flex items-center gap-5 flex-1 min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/3 border border-white/6 text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 group-hover:scale-105 transition-all duration-500 shadow-sm">
          <Globe className="h-5 w-5" />
        </div>
        
        <div className="flex flex-col min-w-0 pr-4">
          <a
            href={`https://${domain.name}`}
            target="_blank"
            className="text-[15px] font-bold text-foreground group-hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 tracking-tight truncate"
          >
            {domain.name}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 bg-white/4 rounded-[6px] text-[10px] font-bold font-mono text-muted-foreground/80 border border-white/5">
              {domain.project}
            </span>
            <span className="text-[11px] text-muted-foreground/60 font-medium hidden sm:block">
              Added {domain.addedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-4 sm:mt-0 shrink-0 ml-17 sm:ml-0">
        {/* Status Badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-[10px] border",
          isVerified ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"
        )}>
          <span className="relative flex h-2 w-2">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", isVerified ? "bg-emerald-400" : "bg-amber-400")}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2 shadow-[0_0_8px_currentColor]", isVerified ? "bg-emerald-400 text-emerald-400" : "bg-amber-400 text-amber-400")}></span>
          </span>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            isVerified ? "text-emerald-400" : "text-amber-400"
          )}>
            {domain.status}
          </span>
        </div>

        {/* SSL Badge hidden on small */}
        <div className="hidden md:flex flex-col items-end w-[80px]">
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">SSL</span>
          <span className={cn(
            "text-[11px] font-bold flex items-center gap-1",
            sslActive ? "text-foreground/80" : "text-amber-400"
          )}>
            {sslActive ? <ShieldCheck className="h-3 w-3 text-emerald-400" /> : <AlertCircle className="h-3 w-3" />}
            {domain.ssl}
          </span>
        </div>

        {/* Dropdown Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-9 w-9 inline-flex items-center justify-center text-muted-foreground/60 hover:text-foreground bg-white/3 hover:bg-white/6 rounded-xl border border-white/5 transition-all">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-[16px] bg-background/95 backdrop-blur-xl border-white/10 card-grain">
            <DropdownMenuItem className="text-xs font-bold text-foreground focus:bg-white/5 cursor-pointer rounded-xl">Edit Configuration</DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold text-foreground focus:bg-white/5 cursor-pointer rounded-xl">Verify Domain</DropdownMenuItem>
            <DropdownMenuItem className="text-xs font-bold text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer rounded-xl mt-1">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
