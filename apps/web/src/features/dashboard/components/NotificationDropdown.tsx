"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsPanel } from "@/features/dashboard/components/NotificationsPanel";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function NotificationDropdown({
  notifications = [],
}: {
  notifications?: DashboardNotification[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="relative text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {notifications.some((item) => !item.read) ? (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[360px] overflow-hidden border border-[var(--hairline)] bg-[var(--ink)] p-0 shadow-2xl shadow-black/40 dashboard-surface"
      >
        <NotificationsPanel initialNotifications={notifications} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
