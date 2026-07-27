import { CheckCircle2, Clock3, Link2, RefreshCw, Server } from "lucide-react";
import { formatDomainDate } from "@/features/dashboard/lib/domain-date";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainMetadataGridProps {
  autoRenew: boolean;
  delegated: boolean;
  domain: DomainDetail;
  renewPending: boolean;
  onToggleRenew(): void;
}

export function DomainMetadataGrid({
  autoRenew,
  delegated,
  domain,
  renewPending,
  onToggleRenew,
}: DomainMetadataGridProps) {
  const expiresAt = domain.expiresAt
    ? formatDomainDate(domain.expiresAt)
    : "Not available";
  const cdnActive =
    Boolean(domain.projectId) &&
    domain.verified &&
    domain.certStatus === "active";
  return (
    <section className="mb-10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="grid sm:grid-cols-2 xl:grid-cols-7">
        <MetadataItem label="Expiration" value={expiresAt} icon={RefreshCw} />
        <MetadataItem
          label="Renewal price"
          value={domain.managed ? "Registrar rate" : "External"}
        />
        <MetadataItem
          label="Registrar"
          value={domain.managed ? "Multivrs" : "Third party"}
        />
        <div className="border-b border-white/8 p-4 sm:border-r xl:border-b-0">
          <p className="text-xs text-white/40">Auto renewal</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {autoRenew ? "On" : "Off"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoRenew}
              aria-label={`Turn auto renewal ${autoRenew ? "off" : "on"} for ${domain.hostname}`}
              disabled={!domain.managed || renewPending}
              onClick={onToggleRenew}
              className={`relative h-5 w-9 rounded-full transition-colors ${autoRenew ? "bg-blue-600" : "bg-white/20"} disabled:opacity-40`}
            >
              <span
                className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${autoRenew ? "left-[18px]" : "left-0.5"}`}
              />
            </button>
          </div>
        </div>
        <MetadataItem
          label="Registered"
          value={formatDomainDate(domain.registeredAt)}
          icon={Clock3}
        />
        <MetadataItem
          label="Nameservers"
          value={delegated ? "Multivrs" : "External"}
          icon={Server}
        />
        <MetadataItem
          label="Multivrs CDN"
          value={cdnActive ? "Active" : "Not connected"}
          icon={cdnActive ? CheckCircle2 : Link2}
          last
        />
      </div>
    </section>
  );
}

function MetadataItem({
  label,
  value,
  icon: Icon,
  last = false,
}: {
  label: string;
  value: string;
  icon?: typeof Clock3;
  last?: boolean;
}) {
  return (
    <div
      className={`border-b border-white/8 p-4 sm:border-r xl:border-b-0 ${last ? "sm:border-r-0" : ""}`}
    >
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-white">
        {Icon ? <Icon className="size-3.5 text-white/40" /> : null}
        {value}
      </p>
    </div>
  );
}
