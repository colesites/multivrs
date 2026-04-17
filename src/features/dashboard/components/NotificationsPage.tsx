"use client";

import { Check, Trash2, ShieldAlert, Globe, Users, Server, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_NOTIFICATIONS } from "@/features/dashboard/constants/dashboard.constants";

const ICON_MAP = {
  success: { icon: Server, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  error: { icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  warning: { icon: Globe, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  info: { icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

export function NotificationsPage() {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Stay up to date with your workspace activities and alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/6 px-4 py-2 text-[11px] font-bold text-foreground hover:bg-white/8 transition-colors">
            <Check className="h-3 w-3" /> Mark All as Read
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/6 px-4 py-2 text-[11px] font-bold hover:bg-white/8 transition-colors text-rose-400/80 hover:text-rose-400">
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-[28px] border border-border bg-background relative overflow-hidden card-grain inner-glow shadow-2xl" style={{ "--glow-color": "rgba(168, 85, 247, 0.08)" } as React.CSSProperties}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-1/2 h-[200px] bg-purple-600/3 blur-[80px] -z-10 rounded-full" />

        {/* Filters Top Bar */}
        <div className="flex items-center border-b border-white/4 p-2 bg-white/1">
           <button className="px-5 py-2.5 text-xs font-bold text-foreground bg-white/4 rounded-xl shadow-sm">All ({MOCK_NOTIFICATIONS.length})</button>
           <button className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
             Unread
             {unreadCount > 0 && <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400">{unreadCount}</span>}
           </button>
           <button className="px-5 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">Archived</button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-white/3 relative z-10">
          {MOCK_NOTIFICATIONS.map((notification) => {
            const { icon: Icon, color } = ICON_MAP[notification.type as keyof typeof ICON_MAP];

            return (
              <div key={notification.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-white/2 transition-colors duration-300">
                 {/* Icon */}
                 <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border", color, !notification.read && "shadow-[0_0_15px_currentColor]")}>
                   <Icon className="h-5 w-5" />
                 </div>

                 {/* Content */}
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                     <h3 className={cn("text-sm font-bold tracking-tight truncate", notification.read ? "text-foreground/70" : "text-foreground")}>
                       {notification.title}
                     </h3>
                     {!notification.read && (
                       <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                         New
                       </span>
                     )}
                   </div>
                   <p className="text-[13px] text-muted-foreground/80 leading-relaxed max-w-3xl">
                     {notification.description}
                   </p>
                 </div>

                 {/* Meta & Actions */}
                 <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 ml-12 sm:ml-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 hidden sm:block">
                      {notification.time}
                    </span>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="h-8 px-3 inline-flex items-center justify-center rounded-lg bg-white/3 border border-white/6 hover:bg-white/8 transition-colors text-[10px] font-bold text-foreground">
                        Archive
                      </button>
                      <button className="h-8 px-3 items-center justify-center rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors text-[10px] font-bold flex gap-1.5">
                        View <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
