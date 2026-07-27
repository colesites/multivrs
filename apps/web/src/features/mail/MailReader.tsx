"use client";

import {
  Archive,
  Inbox,
  MailOpen,
  Reply,
  ShieldAlert,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MailMessageBody } from "@/features/mail/MailMessageBody";
import type {
  MailMessageDetail,
  MailThreadSummary,
} from "@/features/mail/mail.types";

export function MailReader({
  messages,
  onAction,
  onReply,
  thread,
}: {
  messages: MailMessageDetail[];
  onAction: (messageId: string, action: string) => void;
  onReply: (message: MailMessageDetail) => void;
  thread?: MailThreadSummary;
}) {
  if (!thread)
    return (
      <div className="hidden flex-1 place-items-center bg-[#07080a] text-xs text-white/30 md:grid">
        Select a conversation to read it.
      </div>
    );
  const latest = messages.at(-1);
  return (
    <section className="min-w-0 flex-1 bg-[#07080a]">
      <div className="flex min-h-14 items-center gap-2 border-b border-white/[0.07] px-4">
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium">
          {thread.subject}
        </h2>
        {latest ? (
          <>
            <Button
              aria-label="Archive"
              onClick={() => onAction(latest.id, "archive")}
              size="icon-sm"
              variant="ghost"
            >
              <Archive />
            </Button>
            <Button
              aria-label="Move to inbox"
              onClick={() => onAction(latest.id, "inbox")}
              size="icon-sm"
              variant="ghost"
            >
              <Inbox />
            </Button>
            <Button
              aria-label="Mark read"
              onClick={() => onAction(latest.id, "read")}
              size="icon-sm"
              variant="ghost"
            >
              <MailOpen />
            </Button>
            <Button
              aria-label="Star"
              onClick={() => onAction(latest.id, "star")}
              size="icon-sm"
              variant="ghost"
            >
              <Star />
            </Button>
            <Button
              aria-label="Spam"
              onClick={() => onAction(latest.id, "spam")}
              size="icon-sm"
              variant="ghost"
            >
              <ShieldAlert />
            </Button>
            <Button
              aria-label="Trash"
              onClick={() => onAction(latest.id, "trash")}
              size="icon-sm"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </>
        ) : null}
      </div>
      <div className="max-h-[calc(100vh-10.5rem)] overflow-y-auto p-4 md:p-7">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <article
              className="rounded-xl border border-white/[0.08] bg-[#0b0c10]"
              key={message.id}
            >
              <header className="flex gap-3 border-b border-white/[0.06] p-4">
                <span className="grid size-8 place-items-center rounded-full bg-white/[0.06] text-[10px]">
                  {message.fromAddress.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">
                    {message.fromName || message.fromAddress}
                  </p>
                  <p className="truncate text-[10px] text-white/35">
                    to {message.to.join(", ")} ·{" "}
                    {new Date(message.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
                <span className="ml-auto h-fit rounded-full border border-white/10 px-2 py-1 font-mono text-[8px] uppercase text-white/35">
                  {message.status}
                </span>
              </header>
              <MailMessageBody message={message} />
              <footer className="px-4 pb-4">
                <Button
                  onClick={() => onReply(message)}
                  size="sm"
                  variant="outline"
                >
                  <Reply />
                  Reply
                </Button>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
