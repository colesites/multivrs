import { Check, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { DashboardDomain } from "@/lib/services/domain.service";
import { DomainActions } from "./DomainActions";

export function DomainRow({
  domain,
  detailUrl,
  selected = false,
  onToggleSelect,
}: {
  domain: DashboardDomain;
  detailUrl: string;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  return (
    <div
      className={`group flex min-h-16 items-center gap-4 border-b border-border px-4 last:border-b-0 transition-colors ${
        selected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
      }`}
    >
      <label className="shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect?.()}
          aria-label={`${selected ? "Deselect" : "Select"} ${domain.name}`}
          className="sr-only"
        />
        <span
          className={`size-4 rounded flex items-center justify-center border transition-colors ${
            selected
              ? "border-white bg-white text-black"
              : "border-white/20 bg-transparent hover:border-white/40"
          }`}
        >
          {selected ? <Check className="size-3 stroke-[3]" /> : null}
        </span>
      </label>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={detailUrl}
            className="truncate text-sm font-medium text-foreground hover:underline"
          >
            {domain.name}
          </Link>
          <a
            href={`https://${domain.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="sr-only">Open {domain.name}</span>
          </a>
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {domain.managed ? (
            <>
              <RefreshCw className="size-3 shrink-0" />{" "}
              {domain.autoRenew ? "Auto-renews" : "Expires"}{" "}
              {domain.renewalLabel}
            </>
          ) : (
            "Third Party"
          )}
        </p>
      </div>

      {domain.registeredLabel ? (
        <span className="hidden text-xs text-muted-foreground sm:block shrink-0">
          Registered {domain.registeredLabel}
        </span>
      ) : null}

      <DomainActions
        domainId={domain.id}
        detailUrl={detailUrl}
        hostname={domain.name}
        initialAutoRenew={domain.autoRenew}
      />
    </div>
  );
}
