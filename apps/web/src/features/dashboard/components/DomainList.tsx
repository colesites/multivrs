import { Check } from "lucide-react";
import { DomainRow } from "@/features/dashboard/components/DomainRow";
import type { DashboardDomain } from "@/lib/services/domain.service";

interface DomainListProps {
  domains: DashboardDomain[];
  selectedIds: Set<string>;
  teamSlug: string;
  scope: string;
  onToggleAll(): void;
  onToggleOne(id: string): void;
}

export function DomainList({
  domains,
  selectedIds,
  teamSlug,
  scope,
  onToggleAll,
  onToggleOne,
}: DomainListProps) {
  const allSelected = domains.length > 0 && selectedIds.size === domains.length;
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex h-12 items-center border-b border-border px-4 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onToggleAll}
          className="group flex cursor-pointer select-none items-center gap-3"
        >
          <span
            className={`flex size-4 items-center justify-center rounded border transition-colors ${allSelected ? "border-white bg-white text-black" : "border-white/20 bg-transparent group-hover:border-white/40"}`}
          >
            {allSelected ? <Check className="size-3 stroke-[3]" /> : null}
          </span>
          Select all
        </button>
      </div>
      {domains.length ? (
        domains.map((domain) => (
          <DomainRow
            key={domain.id}
            domain={domain}
            detailUrl={`/${teamSlug}/${scope}/domains/${encodeURIComponent(domain.name)}`}
            selected={selectedIds.has(domain.id)}
            onToggleSelect={() => onToggleOne(domain.id)}
          />
        ))
      ) : (
        <div className="py-16 text-center text-sm text-muted-foreground">
          No domains found
        </div>
      )}
    </div>
  );
}
