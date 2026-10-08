"use client";

import {
  Archive,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Forward,
  Inbox,
  Mail,
  MailOpen,
  Printer,
  Reply,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MailMessageBody } from "@/features/mail/MailMessageBody";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";
import { SenderAvatar } from "@/features/mail/SenderAvatar";
import { resolveSenderDisplayName } from "@/features/mail/sender-utils";
import { cn } from "@/lib/utils";

function formatFullDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

function getRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return "";
  } catch {
    return "";
  }
}

export function MailReader({
  messages,
  onAction,
  onForward,
  onReply,
  thread,
  currentIndex,
  totalThreads,
  onNavigate,
  onClose,
  view = "inbox",
  className,
}: {
  messages: MailMessageDetail[];
  onAction: (messageId: string, action: string) => void;
  onForward: (message: MailMessageDetail) => void;
  onReply: (message: MailMessageDetail) => void;
  thread?: MailThreadSummary;
  currentIndex?: number;
  totalThreads?: number;
  onNavigate?: (delta: -1 | 1) => void;
  onClose?: () => void;
  view?: MailView;
  className?: string;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleMessageExpand = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!thread) {
    return (
      <div
        className={cn(
          "hidden h-full min-h-0 flex-1 flex-col items-center justify-center bg-background dark:bg-[#07080a] p-8 text-center md:flex",
          className,
        )}
      >
        <div className="relative mb-5 grid size-16 place-items-center rounded-2xl border border-black/10 dark:border-white/10 bg-black/3 dark:bg-white/4 shadow-sm">
          <Mail className="size-8 text-muted-foreground/60" />
        </div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          No conversation selected
        </h3>
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Select an email from the conversations list to view its contents and attachments.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-black/8 dark:border-white/8 bg-black/2 dark:bg-white/2 px-3.5 py-2 text-[11px] text-muted-foreground">
          <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
            J
          </span>
          <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
            K
          </span>
          <span>to navigate</span>
          <span className="mx-1 text-muted-foreground/30">·</span>
          <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
            R
          </span>
          <span>to reply</span>
        </div>
      </div>
    );
  }

  const latest = messages[messages.length - 1];
  const relativeTime = latest ? getRelativeTime(latest.createdAt) : "";

  return (
    <section
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background dark:bg-[#07080a]",
        className,
      )}
    >
      {/* Unified Toolbar — Exactly 56px (h-14) to match the conversation list header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/10 dark:border-white/10 bg-background/90 dark:bg-[#07080a]/90 backdrop-blur-md px-3 sm:px-6">
        {/* Left: Mobile back & core email action buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {onClose && (
            <Button
              aria-label="Back to conversations"
              className="mr-1 md:hidden"
              onClick={onClose}
              size="icon-sm"
              variant="ghost"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          {latest && (
            <>
              <Button
                aria-label="Archive"
                title="Archive"
                onClick={() => onAction(latest.id, "archive")}
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Archive className="size-4" />
              </Button>

              <Button
                aria-label="Move to inbox"
                title="Move to inbox"
                onClick={() => onAction(latest.id, "inbox")}
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <Inbox className="size-4" />
              </Button>

              <Button
                aria-label="Report spam"
                title="Report spam"
                onClick={() => onAction(latest.id, "spam")}
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
              >
                <ShieldAlert className="size-4" />
              </Button>

              <Button
                aria-label="Delete"
                title="Delete"
                onClick={() => onAction(latest.id, "trash")}
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>

              <div className="mx-1 h-4 w-px bg-black/10 dark:bg-white/10" />

              <Button
                aria-label={thread.unread ? "Mark as read" : "Mark as unread"}
                title={thread.unread ? "Mark as read" : "Mark as unread"}
                onClick={() =>
                  onAction(latest.id, thread.unread ? "read" : "unread")
                }
                size="icon-sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                {thread.unread ? (
                  <MailOpen className="size-4" />
                ) : (
                  <Mail className="size-4" />
                )}
              </Button>

              <Button
                aria-label={thread.starred ? "Unstar" : "Star"}
                title={thread.starred ? "Unstar" : "Star"}
                onClick={() => onAction(latest.id, "star")}
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-amber-400",
                  thread.starred && "text-amber-400 fill-amber-400",
                )}
              >
                <Star
                  className={cn("size-4", thread.starred && "fill-amber-400")}
                />
              </Button>
            </>
          )}
        </div>

        {/* Right: Thread pagination, canvas mode, print */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Thread Pagination (e.g. 1 of 51) */}
          {totalThreads && totalThreads > 0 && currentIndex !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
              <span className="font-mono text-[11px] hidden sm:inline">
                {currentIndex + 1} of {totalThreads}
              </span>
              <div className="flex items-center">
                <Button
                  aria-label="Previous conversation"
                  disabled={currentIndex <= 0}
                  onClick={() => onNavigate?.(-1)}
                  size="icon-sm"
                  variant="ghost"
                  className="size-7"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  aria-label="Next conversation"
                  disabled={currentIndex >= totalThreads - 1}
                  onClick={() => onNavigate?.(1)}
                  size="icon-sm"
                  variant="ghost"
                  className="size-7"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}


          <Button
            aria-label="Print conversation"
            title="Print conversation"
            onClick={handlePrint}
            size="icon-sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hidden sm:flex"
          >
            <Printer className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Reading Pane Canvas — Generous width and comfortable breathing room */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-5xl space-y-6">
          {/* Subject Header: Prominent, bold, readable (The thing that should be big!) */}
          <div className="border-b border-black/8 dark:border-white/8 pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-[26px] font-semibold tracking-tight text-foreground leading-snug break-words">
                    {thread.subject || "(no subject)"}
                  </h1>
                  <span className="inline-flex items-center rounded-md border border-black/10 dark:border-white/10 bg-black/4 dark:bg-white/6 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {view}
                  </span>
                </div>
              </div>

              {latest && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => onReply(latest)}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-medium"
                  >
                    <Reply className="size-3.5" />
                    Reply
                  </Button>
                  <Button
                    onClick={() => onForward(latest)}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-medium hidden sm:flex"
                  >
                    <Forward className="size-3.5" />
                    Forward
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Messages list */}
          <div className="space-y-6">
            {messages.map((message, idx) => {
              const isLatest = idx === messages.length - 1;
              const isExpanded =
                messages.length === 1 ||
                isLatest ||
                expandedMessageIds.has(message.id);

              const senderDisplayName = resolveSenderDisplayName(
                message.fromName,
                message.fromAddress,
              );

              return (
                <article
                  key={message.id}
                  className={cn(
                    "transition-all",
                    idx > 0 && "pt-6 border-t border-black/10 dark:border-white/10",
                  )}
                >
                  {/* Message Header */}
                  <header className="flex items-start gap-3.5 pb-2">
                    <SenderAvatar
                      address={message.fromAddress}
                      name={senderDisplayName}
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        {messages.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => toggleMessageExpand(message.id)}
                            className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition cursor-pointer"
                          >
                            <span className="truncate text-sm sm:text-base font-semibold text-foreground">
                              {senderDisplayName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground hidden sm:inline">
                              &lt;{message.fromAddress}&gt;
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate text-sm sm:text-base font-semibold text-foreground">
                              {senderDisplayName}
                            </span>
                            <span className="truncate text-xs text-muted-foreground hidden sm:inline">
                              &lt;{message.fromAddress}&gt;
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground font-mono">
                          {relativeTime && (
                            <span className="hidden sm:inline font-sans text-muted-foreground/60">
                              ({relativeTime})
                            </span>
                          )}
                          <span>{formatFullDate(message.createdAt)}</span>
                        </div>
                      </div>

                      {/* Recipient Details Row & Dropdown */}
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsOpen(!detailsOpen)}
                          className="group inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition cursor-pointer"
                        >
                          <span>
                            to {message.to.length ? message.to.join(", ") : "me"}
                          </span>
                          <ChevronDown
                            className={cn(
                              "size-3 transition-transform",
                              detailsOpen && "rotate-180",
                            )}
                          />
                        </button>

                        <span className="rounded-full border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {message.status}
                        </span>
                      </div>

                      {/* Expanded Delivery / Security Details Drawer */}
                      {detailsOpen && (
                        <div className="mt-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/3 p-3.5 text-xs text-muted-foreground space-y-1.5 font-mono">
                          <div className="flex gap-2">
                            <span className="w-16 font-medium text-foreground/70 font-sans">
                              From:
                            </span>
                            <span className="text-foreground break-all">
                              {message.fromName ? `${message.fromName} ` : ""}
                              &lt;{message.fromAddress}&gt;
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="w-16 font-medium text-foreground/70 font-sans">
                              To:
                            </span>
                            <span className="text-foreground break-all">
                              {message.to.join(", ")}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="w-16 font-medium text-foreground/70 font-sans">
                              Date:
                            </span>
                            <span className="text-foreground">
                              {formatFullDate(message.createdAt)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="w-16 font-medium text-foreground/70 font-sans">
                              Subject:
                            </span>
                            <span className="text-foreground">
                              {message.subject}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-black/6 dark:border-white/6 text-emerald-600 dark:text-emerald-400 font-sans text-[11px]">
                            <ShieldCheck className="size-3.5 shrink-0" />
                            <span>
                              Delivered securely via TLS encryption
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </header>

                  {/* Message Body */}
                  {isExpanded && (
                    <div className="pt-2 pb-4">
                      <MailMessageBody message={message} />
                    </div>
                  )}

                  {/* Footer actions for multiple messages */}
                  {isExpanded && messages.length > 1 && (
                    <footer className="pt-2 pb-4 flex items-center justify-between text-[11px] text-muted-foreground/60 border-t border-black/6 dark:border-white/6">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onReply(message)}
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        >
                          <Reply className="size-3.5" />
                          Reply
                        </Button>
                        <Button
                          onClick={() => onForward(message)}
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        >
                          <Forward className="size-3.5" />
                          Forward
                        </Button>
                      </div>
                      <div className="font-mono">
                        Message #{idx + 1} of {messages.length}
                      </div>
                    </footer>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
