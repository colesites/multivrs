import SpecularButton from "@/components/SpecularButton";
import { DnsRecordsTable } from "@/features/dashboard/components/DnsRecordsTable";
import type { DnsRecord, DomainDnsOverview } from "@/lib/domains/dns.types";

interface DomainDnsRecordsSectionProps {
  overview: DomainDnsOverview;
  onAdd(): void;
  onEdit(record: DnsRecord): void;
  onEnable(): void;
  onRemove(record: DnsRecord): void;
}

export function DomainDnsRecordsSection(props: DomainDnsRecordsSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">DNS</h2>
          <p className="mt-1 text-sm text-white/45">
            These records come directly from the configured authoritative zone.
          </p>
        </div>
        {props.overview.managed ? null : (
          <SpecularButton
            size="sm"
            tint="#ffffff"
            tintOpacity={0.9}
            lineColor="#ffffff"
            baseColor="#ffffff"
            textColor="#000000"
            onClick={props.onEnable}
          >
            Enable Multivrs DNS
          </SpecularButton>
        )}
      </div>
      <DnsRecordsTable
        records={props.overview.records}
        onAdd={props.onAdd}
        onEdit={props.onEdit}
        onRemove={props.onRemove}
      />
    </section>
  );
}
