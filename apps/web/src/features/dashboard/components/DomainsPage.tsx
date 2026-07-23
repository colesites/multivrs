"use client";

import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type {
  DashboardDomain,
  DomainProjectOption,
} from "@/lib/services/domain.service";
import { ConnectDomainDialog } from "./ConnectDomainDialog";
import { DomainRow } from "./DomainRow";

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
  const visible = domains.filter((domain) =>
    domain.name.includes(query.toLowerCase()),
  );
  const marketplace = `/domains?teamSlug=${encodeURIComponent(teamSlug)}&source=team-domains-header-buy`;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Domains</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Registration, DNS, and certificates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConnectOpen(true)}>
            Connect External
          </Button>
          <Button variant="outline">Transfer In</Button>
          <Button render={<Link href={marketplace} />} nativeButton={false}>
            Buy
          </Button>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <Button variant="outline" size="icon" title="Filter domains">
          <Filter />
        </Button>
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value.toLowerCase())}
            placeholder="Search domains"
            className="h-10 w-full border border-border bg-transparent pl-10 pr-3 text-sm outline-none focus:border-foreground/35"
          />
        </label>
      </div>

      <div className="border border-border">
        <div className="flex h-12 items-center border-b border-border px-4 text-xs text-muted-foreground">
          {visible.length} {visible.length === 1 ? "domain" : "domains"}
        </div>
        {visible.length ? (
          visible.map((domain) => (
            <DomainRow
              key={domain.id}
              domain={domain}
              detailUrl={`/${teamSlug}/${scope}/domains/${domain.id}`}
            />
          ))
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No domains found
          </div>
        )}
      </div>
      <ConnectDomainDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        projects={projects}
      />
    </div>
  );
}
