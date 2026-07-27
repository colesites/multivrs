"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { NotificationItem } from "@/features/dashboard/components/NotificationItem";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function NotificationsPanel({
  initialNotifications,
}: {
  initialNotifications: DashboardNotification[];
}) {
  const [items, setItems] = useState(initialNotifications);
  const [busy, setBusy] = useState<string | null>(null);
  const unread = items.filter((item) => !item.read).length;

  async function mutate(action: "archive" | "read" | "read_all", id?: string) {
    setBusy(id ?? action);
    try {
      const response = await fetch("/api/notifications", {
        body: JSON.stringify({ action, id }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) {
        toast.error("Notification update failed");
        setBusy(null);
        return;
      }
      setItems((current) =>
        action === "archive"
          ? current.filter((item) => item.id !== id)
          : current.map((item) =>
              action === "read_all" || item.id === id
                ? { ...item, read: true }
                : item,
            ),
      );
      toast.success(
        action === "archive"
          ? "Notification archived"
          : "Notifications updated",
      );
      setBusy(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Notification update failed",
      );
      setBusy(null);
    }
  }

  return (
    <div className="flex max-h-[430px] flex-col text-[13px]">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-3">
        <div>
          <p className="font-medium">Notifications</p>
          <p className="text-[11px] text-muted-foreground">{unread} unread</p>
        </div>
        <button
          type="button"
          disabled={!unread || busy !== null}
          onClick={() => mutate("read_all")}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Mark all as read"
        >
          <CheckCheck className="size-4" />
        </button>
      </div>
      <div className="min-h-52 overflow-y-auto">
        {items.map((item) => (
          <NotificationItem
            key={item.id}
            busy={busy === item.id}
            item={item}
            mutate={mutate}
          />
        ))}
        {!items.length ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
            <BellOff className="size-5" />
            <p>You&apos;re all caught up.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
