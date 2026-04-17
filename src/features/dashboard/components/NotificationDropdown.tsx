"use client";

import Link from "next/link";
import { Bell, Check, Server, Globe, Users, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_NOTIFICATIONS } from "@/features/dashboard/constants/dashboard.constants";

const ICON_MAP = {
  success: { icon: Server, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  error: { icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  warning: { icon: Globe, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  info: { icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
};

export function NotificationDropdown() {
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/3 text-muted-foreground border border-white/6 hover:text-foreground hover:bg-white/8 transition-all shadow-sm">
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border-[1.5px] border-background"></span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[380px] p-0 rounded-[24px] border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden card-grain">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
          <div className="flex flex-col">
            <h4 className="text-[15px] font-bold text-foreground">Notifications</h4>
            <span className="text-[11px] font-medium text-muted-foreground/60">{unreadCount} unread messages</span>
          </div>
          <button className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground" title="Mark all as read">
            <Check className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="h-[340px]">
          <div className="p-2 space-y-1">
            {MOCK_NOTIFICATIONS.map((notification) => {
              const { icon: Icon, color } = ICON_MAP[notification.type as keyof typeof ICON_MAP];
              
              return (
                <DropdownMenuItem key={notification.id} className="p-3 rounded-[16px] flex items-start gap-3 cursor-pointer group hover:bg-white/4 transition-colors focus:bg-white/4">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border mt-0.5", color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={cn("text-[13px] font-bold tracking-tight truncate", notification.read ? "text-foreground/70" : "text-foreground")}>
                      {notification.title}
                    </p>
                    <p className="text-[12px] text-muted-foreground/70 leading-snug mt-0.5 line-clamp-2">
                      {notification.description}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 mt-1.5 block">
                      {notification.time}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 mt-2 mr-1" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-2 border-t border-white/5 bg-white/1">
          <Link href="/dashboard/notifications">
            <button className="w-full py-2.5 rounded-[14px] text-[12px] font-bold text-foreground bg-white/3 border border-white/5 hover:bg-white/8 transition-all">
              View all notifications
            </button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
