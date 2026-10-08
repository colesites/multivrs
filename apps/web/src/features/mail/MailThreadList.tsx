"use client";

import { RefreshCw, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MailThreadSummary } from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { resolveSenderDisplayName } from "@/features/mail/sender-utils";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Partial<Record<MailView, string>> = {
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

function formatThreadDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function MailThreadList({
  onSelect,
  onEmptyTrash,
  onRefresh,
  onToggleStar,
  selectedId,
  threads,
  view = "inbox",
  className,
}: {
  onSelect: (id: string) => void;
  onEmptyTrash?: () => void;
  onRefresh: () => void;
  onToggleStar?: (threadId: string, currentStarred: boolean) => void;
  selectedId?: string;
  threads: MailThreadSummary[];
  view?: MailView;
  className?: string;
}) {
  const folderTitle = VIEW_TITLES[view] ?? "Conversations";
  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-r border-black/10 dark:border-white/10 bg-background dark:bg-[#07080a] md:w-80 lg:w-[360px] md:shrink-0 transition-all",
        className,
      )}
    >
      {/* Header — Height 56px (h-14) to align perfectly with the reading pane toolbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {folderTitle}
          </h2>
          <span className="inline-flex items-center rounded-full bg-black/6 dark:bg-white/10 px-2 py-0.5 font-mono text-[11px] text-muted-foreground font-medium">
            {unreadCount > 0 ? `${unreadCount} unread · ${threads.length}` : threads.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Refresh mailbox"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onRefresh}
            size="icon-sm"
            variant="ghost"
          >
            <RefreshCw className="size-3.5" />
          </Button>
          {onEmptyTrash ? (
            <Button
              aria-label="Empty trash"
              className="size-8 text-destructive hover:text-destructive"
              onClick={onEmptyTrash}
              size="icon-sm"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Thread list scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
        {threads.map((thread) => {
          const isSelected = selectedId === thread.id;
          const senderDisplayName = resolveSenderDisplayName(
            thread.correspondentName,
            thread.correspondent,
          );

          return (
            <div
              key={thread.id}
              className={cn(
                "group relative flex w-full items-start transition-colors",
                isSelected
                  ? "bg-accent/12 dark:bg-white/[0.07] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-accent"
                  : "hover:bg-black/4 dark:hover:bg-white/4",
                thread.unread && !isSelected && "bg-black/[0.02] dark:bg-white/[0.02]",
              )}
            >
              <button
                type="button"
                className={cn(
                  "flex min-w-0 flex-1 cursor-pointer items-start gap-3 p-3.5 sm:py-3.5 sm:pl-4 text-left transition-colors focus-visible:outline-none focus-visible:bg-accent/10",
                  onToggleStar ? "pr-1 sm:pr-2" : "sm:pr-4",
                )}
                onClick={() => onSelect(thread.id)}
              >
                <div className="relative mt-0.5 shrink-0">
                  <SenderAvatar
                    address={thread.correspondent}
                    name={senderDisplayName}
                    size="md"
                  />
                  {thread.unread && (
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background dark:border-[#07080a] bg-accent" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        thread.unread
                          ? "font-semibold text-foreground"
                          : "font-medium text-foreground/80",
                      )}
                    >
                      {senderDisplayName}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                      {formatThreadDate(thread.lastMessageAt)}
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "truncate text-xs",
                        thread.unread
                          ? "font-medium text-foreground"
                          : "text-foreground/70",
                      )}
                    >
                      {thread.subject || "(no subject)"}
                    </span>
                    {thread.starred && (
                      <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground/75">
                    {thread.preview}
                  </p>
                </div>
              </button>

              {onToggleStar && (
                <div className="p-3.5 pl-0 sm:py-3.5 sm:pr-4 sm:pl-0">
                  <button
                    type="button"
                    aria-label={thread.starred ? "Unstar" : "Star"}
                    className={cn(
                      "mt-0.5 size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/10",
                      thread.starred && "opacity-100",
                    )}
                    onClick={() => onToggleStar(thread.id, thread.starred)}
                  >
                    <Star
                      className={cn(
                        "size-3.5 text-muted-foreground",
                        thread.starred && "fill-amber-400 text-amber-400",
                      )}
                    />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!threads.length ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="grid size-10 place-items-center rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground mb-3">
              <RefreshCw className="size-4 opacity-40" />
            </div>
            <p className="text-xs font-medium text-foreground">No messages</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              This folder is currently empty.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
