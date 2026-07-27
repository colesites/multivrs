"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { DomainActions } from "@/features/dashboard/components/DomainActions";
import { DomainMetadataGrid } from "@/features/dashboard/components/DomainMetadataGrid";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainOverviewPanelProps {
  autoRenew: boolean;
  backUrl: string;
  delegated: boolean;
  domain: DomainDetail;
  renewPending: boolean;
  onToggleRenew(): void;
}

export function DomainOverviewPanel(props: DomainOverviewPanelProps) {
  const { autoRenew, backUrl, delegated, domain, renewPending, onToggleRenew } =
    props;
  const copyDomain = () => {
    void navigator.clipboard
      .writeText(domain.hostname)
      .then(() => toast.success("Domain copied"));
  };
  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Link
          href={backUrl}
          className="transition-colors hover:text-foreground"
        >
          Domains
        </Link>
        <span>/</span>
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          {domain.hostname}
          <button
            type="button"
            onClick={copyDomain}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Copy ${domain.hostname}`}
          >
            <Copy className="size-3.5" />
          </button>
        </span>
      </div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {domain.hostname}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {domain.managed
              ? "Registered and managed by Multivrs"
              : "Externally registered domain"}
          </p>
        </div>
        <DomainActions
          domainId={domain.id}
          detailUrl="#"
          hostname={domain.hostname}
          initialAutoRenew={autoRenew}
        />
      </div>
      <DomainMetadataGrid
        autoRenew={autoRenew}
        delegated={delegated}
        domain={domain}
        renewPending={renewPending}
        onToggleRenew={onToggleRenew}
      />
    </>
  );
}
