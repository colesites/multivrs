"use client";

import { Mail, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MailDashboardData } from "@/features/mail/mail.types";
import {
  MAIL_NAVIGATION,
  type MailView,
} from "@/features/mail/mail-navigation";
import { cn } from "@/lib/utils";

export function MailNavigation({
  data,
  onCompose,
  onView,
  view,
}: {
  data: MailDashboardData;
  onCompose: () => void;
  onView: (view: MailView) => void;
  view: MailView;
}) {
  return (
    <aside className="hidden min-h-[calc(100vh-3.5rem)] border-r border-white/[0.07] bg-[#08090b] lg:flex lg:w-56 lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.07] px-4">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 to-indigo-500 text-black">
          <Mail className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Multivrs Mail</p>
          <p className="truncate text-[10px] text-white/40">Two-way email</p>
        </div>
        <PanelLeftClose className="ml-auto size-4 text-white/30" />
      </div>
      <div className="p-3">
        <Button
          className="w-full bg-white text-black hover:bg-white/90"
          onClick={onCompose}
        >
          Compose
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2 pb-5">
        {MAIL_NAVIGATION.map((item) => {
          if ("divider" in item)
            return (
              <p
                className="mb-1 mt-5 px-3 font-mono text-[9px] tracking-[0.17em] text-white/25"
                key={item.divider}
              >
                {item.divider}
              </p>
            );
          const Icon = item.icon;
          const count =
            "count" in item ? data.folderCounts[item.count] : undefined;
          return (
            <button
              className={cn(
                "group flex h-8 w-full items-center gap-2.5 rounded-md px-3 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white",
                view === item.view && "bg-white/[0.08] text-white",
              )}
              key={item.view}
              onClick={() => onView(item.view)}
              type="button"
            >
              <Icon className="size-3.5 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
              {count ? (
                <span className="ml-auto text-[10px] text-white/30">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </ScrollArea>
    </aside>
  );
}
