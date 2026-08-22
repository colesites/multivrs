"use client";

import { RefreshCw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import type { MailThreadSummary } from "@/features/mail/mail.types";
import { cn } from "@/lib/utils";

export function MailThreadList({
  onSelect,
  onEmptyTrash,
  onRefresh,
  selectedId,
  threads,
  className,
}: {
  onSelect: (id: string) => void;
  onEmptyTrash?: () => void;
  onRefresh: () => void;
  selectedId?: string;
  threads: MailThreadSummary[];
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col border-r border-black/10 dark:border-white/10 bg-background dark:bg-black md:w-85 md:shrink-0", className)}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 px-4">
        <p className="text-xs font-medium">Conversations</p>
        <div className="flex items-center gap-1">
          <span className="mr-1 font-mono text-[10px] text-black/30 dark:text-white/30">
            {threads.length}
          </span>
          <Button
            aria-label="Refresh mailbox"
            onClick={onRefresh}
            size="icon-sm"
            variant="ghost"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          {onEmptyTrash ? (
            <Button
              aria-label="Empty trash"
              onClick={onEmptyTrash}
              size="icon-sm"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <button
            className={cn(
              "group relative flex w-full gap-3 border-b border-black/5 dark:border-white/5 p-4 text-left transition hover:bg-black/5 dark:bg-white/5",
              selectedId === thread.id && "bg-accent/8",
            )}
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            type="button"
          >
            <div className="flex shrink-0 items-center gap-2">
              {thread.unread ? (
                <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              ) : (
                <span className="w-1.5" />
              )}
              <SenderAvatar
                address={thread.correspondent}
                size="sm"
              />
            </div>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "truncate text-xs",
                    thread.unread
                      ? "font-semibold text-black dark:text-white"
                      : "text-black/65 dark:text-white/65",
                  )}
                >
                  {thread.correspondent}
                </span>
                <span className="ml-auto shrink-0 text-[9px] text-black/25 dark:text-white/25">
                  {new Date(thread.lastMessageAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-1">
                <span className="truncate text-xs text-black/70 dark:text-white/70">
                  {thread.subject}
                </span>
                {thread.starred ? (
                  <Star className="size-3 fill-amber-300 text-amber-300" />
                ) : null}
              </span>
              <span className="mt-1 block truncate text-[11px] text-black/30 dark:text-white/30">
                {thread.preview}
              </span>
            </span>
          </button>
        ))}
        {!threads.length ? (
          <p className="p-8 text-center text-xs text-black/35 dark:text-white/35">
            Nothing in this folder.
          </p>
        ) : null}
      </div>
    </div>
  );
}
