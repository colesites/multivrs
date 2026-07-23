import { ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { DashboardDomain } from "@/lib/services/domain.service";
import { DomainActions } from "./DomainActions";

export function DomainRow({
  domain,
  detailUrl,
}: {
  domain: DashboardDomain;
  detailUrl: string;
}) {
  return (
    <div className="group flex min-h-20 items-center gap-4 border-b border-border px-4 last:border-b-0 hover:bg-white/[0.02]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={detailUrl}
            className="truncate text-sm font-medium hover:underline"
          >
            {domain.name}
          </Link>
          <a
            href={`https://${domain.name}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-3 opacity-0 group-hover:opacity-50" />
            <span className="sr-only">Open {domain.name}</span>
          </a>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {domain.managed ? (
            <>
              <RefreshCw className="size-3" /> Auto-renew {domain.renewalLabel}
            </>
          ) : (
            "Third party"
          )}
        </p>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block">
        {domain.project}
      </span>
      <span className="w-20 text-right text-xs text-muted-foreground">
        {domain.status}
      </span>
      <DomainActions
        domainId={domain.id}
        detailUrl={detailUrl}
        hostname={domain.name}
      />
    </div>
  );
}
