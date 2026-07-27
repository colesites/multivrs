"use client";

import { CircleDashed, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MailAnalytics, MailSettings } from "@/features/mail/MailAnalytics";
import { MailCreateDialog } from "@/features/mail/MailCreateDialog";
import { MailResourceRow } from "@/features/mail/MailResourceRow";
import type {
  MailDashboardData,
  MailResourceItem,
} from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";
import { isCreateMailView } from "@/features/mail/mail-resource-form";

const descriptions: Partial<Record<MailView, string>> = {
  logs: "Every outbound and inbound message with its truthful delivery state.",
  broadcasts: "Create and schedule campaigns for a consent-aware audience.",
  automations: "Event-driven email workflows with versioned steps.",
  templates: "Reusable, versioned content for transactional and campaign mail.",
  contacts: "People, consent state, tags, and suppression history.",
  audiences: "Reusable contact collections for campaigns.",
  domains:
    "DNS-backed sending, receiving, tracking, and return-path identities.",
  mailboxes: "Personal and shared addresses with a real inbox.",
  credentials: "Scoped API keys and SMTP credentials. Secrets are shown once.",
  webhooks: "Signed event delivery with retries and delivery history.",
};

export function MailResourcePage({
  data,
  projectId,
  query,
  view,
}: {
  data: MailDashboardData;
  projectId?: string;
  query: string;
  view: MailView;
}) {
  const [creating, setCreating] = useState(false);
  const items = resourceItems(data, view).filter((item) =>
    `${item.name} ${item.detail} ${item.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (view === "analytics") return <MailAnalytics data={data} />;
  if (view === "settings") return <MailSettings />;
  return (
    <div className="w-full space-y-6 px-5 py-8 lg:px-8">
      <header className="flex items-end justify-between gap-5">
        <p className="max-w-2xl text-sm leading-6 text-white/40">
          {descriptions[view]}
        </p>
        {isCreateMailView(view) ? (
          <Button
            className="bg-white text-black hover:bg-white/90"
            onClick={() => setCreating(true)}
          >
            <Plus />
            Create
          </Button>
        ) : null}
      </header>
      <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a0d]">
        <div className="grid grid-cols-[1.4fr_.9fr_.45fr_32px] border-b border-white/[0.08] bg-white/[0.025] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-white/25">
          <span>Name</span>
          <span>Detail</span>
          <span>Status</span>
          <span />
        </div>
        {items.map((item) => (
          <MailResourceRow item={item} key={item.id} view={view} />
        ))}
        {!items.length ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <CircleDashed className="mx-auto size-7 text-white/20" />
              <p className="mt-3 text-sm text-white/50">Nothing here yet</p>
              <p className="mt-1 text-xs text-white/25">
                Create your first resource to get started.
              </p>
            </div>
          </div>
        ) : null}
      </section>
      {isCreateMailView(view) ? (
        <MailCreateDialog
          data={data}
          onOpenChange={setCreating}
          open={creating}
          projectId={projectId}
          view={view}
        />
      ) : null}
    </div>
  );
}

function resourceItems(
  data: MailDashboardData,
  view: MailView,
): MailResourceItem[] {
  if (view === "mailboxes")
    return data.mailboxes.map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.address,
      status: item.status,
      createdAt: "",
    }));
  if (view === "logs")
    return Object.values(data.messages)
      .flat()
      .map((item) => ({
        id: item.id,
        name: item.subject,
        detail: `${item.direction} · ${item.fromAddress}`,
        status: item.status,
        createdAt: item.createdAt,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (view === "domains") return data.resources.domains;
  if (view === "contacts") return data.resources.contacts;
  if (view === "audiences") return data.resources.audiences;
  if (view === "templates") return data.resources.templates;
  if (view === "broadcasts") return data.resources.broadcasts;
  if (view === "automations") return data.resources.automations;
  if (view === "credentials") return data.resources.credentials;
  if (view === "webhooks") return data.resources.webhooks;
  return [];
}
