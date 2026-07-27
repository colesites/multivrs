"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DnsRecordDialog } from "@/features/dashboard/components/DnsRecordDialog";
import { DomainConnectionSection } from "@/features/dashboard/components/DomainConnectionSection";
import { DomainDnsRecordsSection } from "@/features/dashboard/components/DomainDnsRecordsSection";
import { DomainDnsStatusPanels } from "@/features/dashboard/components/DomainDnsStatusPanels";
import { DomainOverviewPanel } from "@/features/dashboard/components/DomainOverviewPanel";
import { useDomainDns } from "@/features/dashboard/use-domain-dns";
import type { DomainDetail, DomainDnsOverview } from "@/lib/domains/dns.types";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface DomainDnsPageProps {
  domain: DomainDetail;
  initialOverview: DomainDnsOverview;
  backUrl: string;
  projects: DomainProjectOption[];
}

export function DomainDnsPage({
  domain,
  initialOverview,
  backUrl,
  projects,
}: DomainDnsPageProps) {
  const dns = useDomainDns(domain, initialOverview);
  const [autoRenew, setAutoRenew] = useState(domain.autoRenew);
  const [renewPending, setRenewPending] = useState(false);

  function updateAutoRenew() {
    if (renewPending) return;
    const next = !autoRenew;
    setAutoRenew(next);
    setRenewPending(true);
    void fetch(`/api/domains/${domain.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ autoRenew: next }),
    })
      .then((response) => {
        setRenewPending(false);
        if (response.ok) {
          toast.success(`Auto renewal ${next ? "enabled" : "disabled"}`);
          return;
        }
        setAutoRenew(!next);
        toast.error("Unable to update auto renewal");
      })
      .catch((error: unknown) => {
        setAutoRenew(!next);
        setRenewPending(false);
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update auto renewal",
        );
      });
  }

  return (
    <div className="w-full px-5 py-6 sm:px-8">
      <DomainOverviewPanel
        autoRenew={autoRenew}
        backUrl={backUrl}
        delegated={dns.overview.delegated}
        domain={domain}
        renewPending={renewPending}
        onToggleRenew={updateAutoRenew}
      />
      <DomainConnectionSection domain={domain} projects={projects} />
      <DomainDnsRecordsSection
        overview={dns.overview}
        onAdd={() => dns.setEditorOpen(true)}
        onEdit={(record) => {
          dns.setEditing(record);
          dns.setEditorOpen(true);
        }}
        onEnable={dns.enable}
        onRemove={dns.remove}
      />
      <DomainDnsStatusPanels domain={domain} overview={dns.overview} />
      {dns.editorOpen ? (
        <DnsRecordDialog
          open
          onOpenChange={(open) => {
            dns.setEditorOpen(open);
            if (!open) dns.setEditing(undefined);
          }}
          record={dns.editing}
          pending={dns.pending}
          onSubmit={dns.save}
        />
      ) : null}
    </div>
  );
}
