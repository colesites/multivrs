"use client";

import { useState } from "react";
import { ConnectDomainDialog } from "@/features/dashboard/components/ConnectDomainDialog";
import { DomainList } from "@/features/dashboard/components/DomainList";
import { DomainsToolbar } from "@/features/dashboard/components/DomainsToolbar";
import type {
  DashboardDomain,
  DomainProjectOption,
} from "@/lib/services/domain.service";

interface DomainsPageProps {
  domains: DashboardDomain[];
  projects: DomainProjectOption[];
  teamSlug: string;
  scope: string;
}

export function DomainsPage({
  domains,
  projects,
  teamSlug,
  scope,
}: DomainsPageProps) {
  const [query, setQuery] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const visible = domains.filter((domain) => domain.name.includes(query));
  const allSelected = visible.length > 0 && selectedIds.size === visible.length;
  const marketplace = `/domains?teamSlug=${encodeURIComponent(teamSlug)}&source=team-domains-header-buy`;

  function toggleSelectOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="w-full px-8 py-6">
      <DomainsToolbar
        marketplace={marketplace}
        query={query}
        onConnect={() => setConnectOpen(true)}
        onQueryChange={setQuery}
      />
      <DomainList
        domains={visible}
        selectedIds={selectedIds}
        teamSlug={teamSlug}
        scope={scope}
        onToggleAll={() =>
          setSelectedIds(
            allSelected
              ? new Set()
              : new Set(visible.map((domain) => domain.id)),
          )
        }
        onToggleOne={toggleSelectOne}
      />
      <ConnectDomainDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        projects={projects}
      />
    </div>
  );
}
