"use client";

import { CircleDashed, Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { MailAnalytics, MailSettings } from "@/features/mail/MailAnalytics";
import { MailBroadcastCompose } from "@/features/mail/MailBroadcastCompose";
import { MailCreateDialog } from "@/features/mail/MailCreateDialog";
import { MailResourceRow } from "@/features/mail/MailResourceRow";
import { MailResourceSkeleton } from "@/features/mail/MailSkeletons";
import type {
  MailDashboardData,
  MailResourceItem,
  MailResources,
} from "@/features/mail/mail.types";
import { useMailData, useMailResources } from "@/features/mail/mail-context";
import { useMailLog } from "@/features/mail/mail-data.client";
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
  projectId,
  query,
  view,
}: {
  projectId?: string;
  query: string;
  view: MailView;
}) {
  if (view === "settings") return <MailSettings />;
  // The log pages through messages on its own; everything else is shared data.
  if (view === "logs") return <MailLogTable query={query} />;
  return (
    <Suspense fallback={<MailResourceSkeleton />}>
      {view === "analytics" ? (
        <MailAnalyticsWithData />
      ) : (
        <MailResourceTable projectId={projectId} query={query} view={view} />
      )}
    </Suspense>
  );
}

function MailAnalyticsWithData() {
  return <MailAnalytics data={useMailData()} />;
}

function MailResourceTable({
  projectId,
  query,
  view,
}: {
  projectId?: string;
  query: string;
  view: MailView;
}) {
  const data = useMailData();
  const resources = useMailResources();
  const [creating, setCreating] = useState(false);
  return (
    <ResourceTable
      action={
        isCreateMailView(view) ? (
          <Button
            className="bg-foreground text-background hover:bg-foreground/90 shrink-0"
            onClick={() => setCreating(true)}
          >
            <Plus />
            Create
          </Button>
        ) : null
      }
      items={matching(resourceItems(view, data, resources), query)}
      view={view}
    >
      {view === "broadcasts" && creating ? (
        <MailBroadcastCompose
          key={`broadcast-${Date.now()}`}
          open={creating}
          onOpenChange={setCreating}
          projectId={projectId}
          resources={resources}
        />
      ) : isCreateMailView(view) && creating ? (
        <MailCreateDialog
          key={`${view}-${Date.now()}`}
          resources={resources}
          onOpenChange={setCreating}
          open={creating}
          projectId={projectId}
          view={view}
        />
      ) : null}
    </ResourceTable>
  );
}

/** The email log, newest first, a page at a time. */
function MailLogTable({ query }: { query: string }) {
  const log = useMailLog();
  if (log.loading) return <MailResourceSkeleton />;
  return (
    <ResourceTable items={matching(log.items, query)} view="logs">
      {log.hasMore ? (
        <Button
          className="w-full"
          disabled={log.loadingMore}
          onClick={log.loadMore}
          variant="outline"
        >
          {log.loadingMore ? "Loading…" : "Load older messages"}
        </Button>
      ) : null}
    </ResourceTable>
  );
}

function matching(items: MailResourceItem[], query: string) {
  const needle = query.toLowerCase();
  return items.filter((item) =>
    `${item.name} ${item.detail} ${item.status}`.toLowerCase().includes(needle),
  );
}

function ResourceTable({
  action,
  children,
  items,
  view,
}: {
  action?: React.ReactNode;
  children?: React.ReactNode;
  items: MailResourceItem[];
  view: MailView;
}) {
  return (
    <div className="w-full min-w-0 max-w-full space-y-6 px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <header className="flex items-end justify-between gap-5">
        <p className="max-w-2xl text-sm leading-6 text-black/60 dark:text-white/60">
          {descriptions[view]}
        </p>
        {action}
      </header>
      <section className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-black">
        <div className="min-w-[480px]">
          <div className="grid grid-cols-[1.4fr_.9fr_.45fr_32px] border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.13em] text-black/80 dark:text-white/80">
            <span>Name</span>
            <span>Detail</span>
            <span>Status</span>
            <span />
          </div>
          {items.map((item) => (
            <MailResourceRow item={item} key={item.id} view={view} />
          ))}
        </div>
        {!items.length ? (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <CircleDashed className="mx-auto size-7 text-black/60 dark:text-white/60" />
              <p className="mt-3 text-sm font-medium text-black dark:text-white">
                Nothing here yet
              </p>
              <p className="mt-1 text-xs text-black/80 dark:text-white/80">
                Create your first resource to get started.
              </p>
            </div>
          </div>
        ) : null}
      </section>
      {children}
    </div>
  );
}

function resourceItems(
  view: MailView,
  data: MailDashboardData,
  resources: MailResources,
): MailResourceItem[] {
  if (view === "mailboxes")
    return data.mailboxes.map((item) => ({
      id: item.id,
      name: item.name,
      detail: `${item.address} · ${item.kind}`,
      status: item.status,
      createdAt: "",
      address: item.address,
      kind: item.kind,
    }));
  if (view === "domains") return resources.domains;
  if (view === "contacts") return resources.contacts;
  if (view === "audiences") return resources.audiences;
  if (view === "templates") return resources.templates;
  if (view === "broadcasts") return resources.broadcasts;
  if (view === "automations") return resources.automations;
  if (view === "credentials") return resources.credentials;
  if (view === "webhooks") return resources.webhooks;
  return [];
}
