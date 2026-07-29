"use client";

import { Bell, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import { AccountMenu } from "./AccountMenu";
import { NotificationsPanel } from "./NotificationsPanel";

interface SidebarFooterProps {
  name: string;
  email: string;
  image?: string | null;
  notifications: DashboardNotification[];
}

export function SidebarFooter({
  name,
  email,
  image,
  notifications,
}: SidebarFooterProps) {
  const initial = (name?.[0] ?? "U").toUpperCase();

  return (
    <div className="flex items-center gap-2 border-t border-[var(--hairline)] px-4 py-3">
      {image ? (
        <Image
          src={image}
          alt=""
          height={28}
          unoptimized
          width={28}
          className="size-7 shrink-0 rounded-full border border-[var(--hairline-strong)] object-cover"
        />
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[var(--hairline-strong)] bg-white/[0.04] font-geist-mono text-[12px] font-medium text-foreground">
          {initial}
        </span>
      )}
      <span className="flex-1 truncate text-[13.5px] font-medium tracking-[-0.01em] text-foreground">
        {name}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          className="flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground"
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-[300px] rounded-2xl border border-[var(--hairline)] bg-[var(--ink)] p-1.5 font-hanken shadow-2xl shadow-black/40 dashboard-surface"
        >
          <AccountMenu name={name} email={email} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Notifications"
          className="relative flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] text-muted-foreground transition-colors hover:border-[var(--hairline-strong)] hover:text-foreground"
        >
          <Bell className="size-4" strokeWidth={1.75} />
          {notifications.some((item) => !item.read) ? (
            <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent ring-2 ring-[var(--ink)]" />
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={10}
          className="w-[340px] overflow-hidden rounded-2xl border border-[var(--hairline)] bg-[var(--ink)] p-0 font-hanken shadow-2xl shadow-black/40 dashboard-surface"
        >
          <NotificationsPanel initialNotifications={notifications} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
