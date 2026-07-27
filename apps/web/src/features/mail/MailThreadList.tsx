"use client";

import { Star } from "lucide-react";
import type { MailThreadSummary } from "@/features/mail/mail.types";
import { cn } from "@/lib/utils";

export function MailThreadList({
  onSelect,
  selectedId,
  threads,
}: {
  onSelect: (id: string) => void;
  selectedId?: string;
  threads: MailThreadSummary[];
}) {
  return (
    <div className="border-r border-white/[0.07] bg-[#090a0d] md:w-[340px] md:shrink-0">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
        <p className="text-xs font-medium">Conversations</p>
        <span className="font-mono text-[10px] text-white/30">
          {threads.length}
        </span>
      </div>
      <div className="max-h-[calc(100vh-10.5rem)] overflow-y-auto">
        {threads.map((thread) => (
          <button
            className={cn(
              "group relative flex w-full gap-3 border-b border-white/[0.055] p-4 text-left transition hover:bg-white/[0.025]",
              selectedId === thread.id && "bg-accent/[0.08]",
            )}
            key={thread.id}
            onClick={() => onSelect(thread.id)}
            type="button"
          >
            {thread.unread ? (
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
            ) : (
              <span className="w-1.5" />
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "truncate text-xs",
                    thread.unread
                      ? "font-semibold text-white"
                      : "text-white/65",
                  )}
                >
                  {thread.correspondent}
                </span>
                <span className="ml-auto shrink-0 text-[9px] text-white/25">
                  {new Date(thread.lastMessageAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </span>
              <span className="mt-1 flex items-center gap-1">
                <span className="truncate text-xs text-white/70">
                  {thread.subject}
                </span>
                {thread.starred ? (
                  <Star className="size-3 fill-amber-300 text-amber-300" />
                ) : null}
              </span>
              <span className="mt-1 block truncate text-[11px] text-white/30">
                {thread.preview}
              </span>
            </span>
          </button>
        ))}
        {!threads.length ? (
          <p className="p-8 text-center text-xs text-white/35">
            Nothing in this folder.
          </p>
        ) : null}
      </div>
    </div>
  );
}
