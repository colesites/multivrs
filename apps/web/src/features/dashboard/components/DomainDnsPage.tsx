"use client";

import { useDomainDns } from "@/features/dashboard/use-domain-dns";
import type { DomainDetail, DomainDnsOverview } from "@/lib/domains/dns.types";
import { DnsRecordDialog } from "./DnsRecordDialog";
import { DnsRecordsTable } from "./DnsRecordsTable";
import { DomainDnsHeader, DomainStatusCard } from "./DomainDnsHeader";
import { DomainDnsSetup } from "./DomainDnsSetup";
import { DomainNameserversCard } from "./DomainNameserversCard";
import { DomainVerificationCard } from "./DomainVerificationCard";

interface DomainDnsPageProps {
  domain: DomainDetail;
  initialOverview: DomainDnsOverview;
  backUrl: string;
}

export function DomainDnsPage({
  domain,
  initialOverview,
  backUrl,
}: DomainDnsPageProps) {
  const dns = useDomainDns(domain, initialOverview);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-7">
      <DomainDnsHeader
        domain={domain}
        backUrl={backUrl}
        managed={dns.overview.managed}
      />
      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-5">
          <DomainVerificationCard
            domain={domain}
            managed={dns.overview.managed}
            recordPresent={dns.overview.records.some(
              (record) =>
                record.type === "TXT" &&
                record.name === domain.verificationName &&
                record.value === domain.verificationValue,
            )}
            onAddRecord={dns.addVerification}
          />
          {dns.overview.managed ? (
            <DnsRecordsTable
              records={dns.overview.records}
              onAdd={() => {
                dns.setEditing(undefined);
                dns.setEditorOpen(true);
              }}
              onEdit={(record) => {
                dns.setEditing(record);
                dns.setEditorOpen(true);
              }}
              onRemove={dns.remove}
            />
          ) : (
            <DomainDnsSetup hostname={domain.hostname} onEnable={dns.enable} />
          )}
        </div>
        <div className="grid content-start gap-5">
          <DomainNameserversCard overview={dns.overview} />
          <DomainStatusCard domain={domain} overview={dns.overview} />
        </div>
      </div>
      {dns.editorOpen ? (
        <DnsRecordDialog
          open
          onOpenChange={dns.setEditorOpen}
          record={dns.editing}
          pending={dns.pending}
          onSubmit={dns.save}
        />
      ) : null}
    </div>
  );
}
