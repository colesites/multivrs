"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  Mail,
  MousePointerClick,
  Send,
} from "lucide-react";
import type { MailDashboardData } from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";

export function MailOverview({
  data,
  onView,
}: {
  data: MailDashboardData;
  onView: (view: MailView) => void;
}) {
  const metrics = [
    ["Sent this month", data.stats.sent.toLocaleString(), Send],
    ["Received", data.stats.received.toLocaleString(), Inbox],
    ["Delivery rate", `${data.stats.deliveryRate}%`, CheckCircle2],
    ["Open rate", `${data.stats.openRate}%`, MousePointerClick],
  ] as const;
  return (
    <div className="w-full space-y-8 px-5 py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,.15),transparent_34%),linear-gradient(130deg,#f8f9fa,#e9ecef)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(37,99,235,.15),transparent_34%),linear-gradient(130deg,#0c1015,#08090c)] p-6 md:p-8">
        <div className="absolute right-8 top-8 size-24 rounded-full bg-accent/10 blur-3xl" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/70">
          Communications control plane
        </p>
        <h2 className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.03em] md:text-3xl">
          One mailbox for product mail, support conversations, and campaigns.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45 dark:text-white/45">
          Incoming and outgoing mail share a real thread model. Delivery states
          come from provider events—not optimistic UI.
        </p>
      </section>
      <section className="grid gap-px overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/10 dark:bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <div className="bg-white dark:bg-[#090b0f] p-5" key={label}>
            <Icon className="size-4 text-accent/70" />
            <p className="mt-5 text-2xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-black/40 dark:text-white/40">{label}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#090a0d]">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 p-4">
            <div>
              <h3 className="text-sm font-medium">Recent conversations</h3>
              <p className="mt-1 text-xs text-black/35 dark:text-white/35">
                The latest activity across every mailbox.
              </p>
            </div>
            <button
              className="flex items-center gap-1 text-xs text-accent"
              onClick={() => onView("inbox")}
              type="button"
            >
              Open inbox <ArrowUpRight className="size-3" />
            </button>
          </div>
          {data.threads.slice(0, 5).map((thread) => (
            <button
              className="block w-full border-b border-black/5 dark:border-white/5 px-4 py-3 text-left last:border-0 hover:bg-black/5 dark:bg-white/5"
              key={thread.id}
              onClick={() => onView("inbox")}
              type="button"
            >
              <div className="flex w-full items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[10px]">
                  {thread.correspondent.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs text-black/80 dark:text-white/80">
                    {thread.subject}
                  </span>
                  <span className="block truncate text-[11px] text-black/35 dark:text-white/35">
                    {thread.preview}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-[10px] text-black/25 dark:text-white/25">
                  {new Date(thread.lastMessageAt).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                  })}
                </span>
              </div>
            </button>
          ))}
          {!data.threads.length ? <EmptyMail /> : null}
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#090a0d] p-5">
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
            <Status label="Contacts" value={data.resources.contacts.length} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Status({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 text-xs">
      <span className="text-black/45 dark:text-white/45">{label}</span>
      <span className="font-mono text-black/80 dark:text-white/80">{value}</span>
    </div>
  );
}
function EmptyMail() {
  return (
    <div className="grid min-h-48 place-items-center text-center">
      <div>
        <Mail className="mx-auto size-6 text-black/20 dark:text-white/20" />
        <p className="mt-3 text-xs text-black/35 dark:text-white/35">No conversations yet</p>
      </div>
    </div>
  );
}
