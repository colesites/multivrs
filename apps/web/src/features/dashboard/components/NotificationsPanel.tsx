"use client";

import { BellOff, Settings2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = "inbox" | "archive" | "comments";

const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "archive", label: "Archive" },
  { id: "comments", label: "Comments" },
];

/**
 * Notifications panel opened from the footer bell. Tabbed (Inbox / Archive /
 * Comments) with an empty state and a push-notification prompt. Data wiring is
 * a follow-up; the shell matches the product's chrome.
 */
export function NotificationsPanel() {
  const [tab, setTab] = useState<Tab>("inbox");
  const [showPush, setShowPush] = useState(true);

  return (
    <div className="flex h-[420px] flex-col text-[13px]">
      <div className="flex items-center justify-between border-b border-[var(--hairline)] px-3 pt-2">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-2 pb-2.5 pt-1 font-medium transition-colors",
                tab === t.id
                  ? "text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--accent)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Notification settings"
          className="rounded-md p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          <Settings2 className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <BellOff
          className="size-6 text-muted-foreground/40"
          strokeWidth={1.5}
        />
        <p className="text-muted-foreground">
          {tab === "inbox"
            ? "You're all caught up."
            : tab === "archive"
              ? "Nothing archived yet."
              : "No comments yet."}
        </p>
      </div>

      {showPush && (
        <div className="border-t border-[var(--hairline)] p-3">
          <p className="text-[12px] text-muted-foreground">
            Enable push notifications to receive updates on desktop or mobile.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => setShowPush(false)}
              className="flex-1 rounded-lg border border-[var(--hairline)] py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-foreground py-1.5 font-medium text-background transition-opacity hover:opacity-90"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="border-t border-[var(--hairline)] py-2.5 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Archive All
      </button>
    </div>
  );
}
