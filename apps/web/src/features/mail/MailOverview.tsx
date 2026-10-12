"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Mail,
  MousePointerClick,
  Send,
} from "lucide-react";
import { Suspense } from "react";
import { MailOverviewHero } from "@/features/mail/MailOverviewHero";
import { MailOverviewDataSkeleton } from "@/features/mail/MailSkeletons";
import { useMailData } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-navigation";
import { SenderAvatar } from "@/features/mail/SenderAvatar";

export function MailOverview({ onView }: { onView: (view: MailView) => void }) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-6 sm:space-y-8 px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <MailOverviewHero />
      <Suspense fallback={<MailOverviewDataSkeleton />}>
        <OverviewData onView={onView} />
      </Suspense>
    </div>
  );
}

/** Metrics, recent conversations and infrastructure, once the data arrives. */
function OverviewData({ onView }: { onView: (view: MailView) => void }) {
  const data = useMailData();
  const metrics = [
    ["Sent this month", data.stats.sent.toLocaleString(), Send],
    ["Received", data.stats.received.toLocaleString(), Inbox],
    ["Delivery rate", `${data.stats.deliveryRate}%`, CheckCircle2],
    ["Open rate", `${data.stats.openRate}%`, MousePointerClick],
  ] as const;
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid grid-cols-2 lg:grid-cols-4 min-w-0 max-w-full gap-px overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10">
        {metrics.map(([label, value, Icon]) => (
          <div
            className="bg-white dark:bg-black p-4 sm:p-5 min-w-0"
            key={label}
          >
            <Icon className="size-4 text-accent/70 shrink-0" />
            <p className="mt-3 sm:mt-5 text-xl sm:text-2xl font-medium tracking-tight truncate">
              {value}
            </p>
            <p className="mt-1 text-xs text-black/40 dark:text-white/40 truncate">
              {label}
            </p>
          </div>
        ))}
      </section>
      <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_320px] gap-4 min-w-0 max-w-full">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black min-w-0 max-w-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 p-4 gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium truncate">
                Recent conversations
              </h3>
              <p className="mt-1 text-xs text-black/35 dark:text-white/35 truncate">
                The latest activity across every mailbox.
              </p>
            </div>
            <button
              className="flex shrink-0 items-center gap-1 text-xs text-accent transition-colors hover:text-accent/80"
              onClick={() => onView("inbox")}
              type="button"
            >
              <span>Open inbox</span> <ArrowUpRight className="size-3" />
            </button>
          </div>
          {data.recentThreads.map((thread) => (
            <button
              className="group block w-full min-w-0 max-w-full border-b border-black/5 dark:border-white/5 px-4 py-3 text-left last:border-0 hover:bg-black/5 dark:bg-white/5 transition-colors overflow-hidden"
              key={thread.id}
              onClick={() => onView("inbox")}
              type="button"
            >
              <div className="flex w-full min-w-0 max-w-full items-center gap-3">
                <SenderAvatar
                  address={thread.correspondent}
                  name={thread.correspondentName}
                  size="md"
                  className="hidden sm:grid shrink-0"
                />
                <div className="min-w-0 flex-1 max-w-full">
                  <div className="flex w-full min-w-0 items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-xs sm:text-sm font-medium text-black/80 dark:text-white/80">
                      {thread.subject}
                    </span>
                    <span className="shrink-0 text-[10px] sm:text-xs text-black/40 dark:text-white/40">
                      {new Date(thread.lastMessageAt).toLocaleDateString(
                        "en-US",
                        {
                          timeZone: "UTC",
                        },
                      )}
                    </span>
                  </div>
                  <p className="min-w-0 max-w-full truncate text-xs sm:text-[11px] leading-snug sm:leading-normal text-black/45 sm:text-black/35 dark:text-white/45 sm:dark:text-white/35 mt-0.5 sm:mt-0">
                    {thread.preview}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {!data.recentThreads.length ? <EmptyMail /> : null}
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-4 sm:p-5 min-w-0 max-w-full">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/30 dark:text-white/30">
            Infrastructure
          </p>
          <div className="mt-5 space-y-4">
            <Status
              label="Active mailboxes"
              value={data.stats.activeMailboxes}
            />
            <Status
              label="Verified domains"
              value={data.stats.verifiedDomains}
            />
            <Status label="Contacts" value={data.stats.contacts} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Status({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 text-xs gap-3 min-w-0">
      <span className="text-black/45 dark:text-white/45 truncate min-w-0">
        {label}
      </span>
      <span className="font-mono text-black/80 dark:text-white/80 shrink-0">
        {value}
      </span>
    </div>
  );
}
function EmptyMail() {
  return (
    <div className="grid min-h-48 place-items-center text-center">
      <div>
        <Mail className="mx-auto size-6 text-black/20 dark:text-white/20" />
        <p className="mt-3 text-xs text-black/35 dark:text-white/35">
          No conversations yet
        </p>
      </div>
    </div>
  );
}
