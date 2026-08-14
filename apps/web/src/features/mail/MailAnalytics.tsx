"use client";

import type { MailDashboardData } from "@/features/mail/mail.types";

export function MailAnalytics({ data }: { data: MailDashboardData }) {
  const stats = [
    ["Sent", data.stats.sent],
    ["Received", data.stats.received],
    ["Delivered", `${data.stats.deliveryRate}%`],
    ["Opened", `${data.stats.openRate}%`],
  ];
  return (
    <div className="w-full px-5 py-8 lg:px-8">
      <div className="grid gap-px overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div className="bg-white dark:bg-black p-6" key={label}>
            <p className="text-3xl tracking-tight">{value}</p>
            <p className="mt-2 text-xs text-black/35 dark:text-white/35">{label}</p>
            <div className="mt-8 h-12 bg-[linear-gradient(150deg,transparent_45%,rgba(168,85,247,.45)_46%,transparent_48%)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MailSettings() {
  return (
    <div className="w-full px-5 py-8 lg:px-8">
      <section className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6">
        <h2 className="text-sm font-medium">Mail policy</h2>
        <div className="mt-6 space-y-4">
          <Setting
            label="Remote images"
            value="Blocked until the reader allows them"
          />
          <Setting
            label="Webhook signatures"
            value="HMAC SHA-256 with a five-minute replay window"
          />
          <Setting
            label="Delivery truth"
            value="Updated only from provider events"
          />
          <Setting label="Secrets" value="Hashed at rest and displayed once" />
        </div>
      </section>
    </div>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-black/10 dark:border-white/10 pb-4 text-xs sm:flex-row">
      <span className="text-black/65 dark:text-white/65">{label}</span>
      <span className="text-black/30 dark:text-white/30">{value}</span>
    </div>
  );
}
