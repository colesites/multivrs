import { ArrowLeft, ExternalLink, Globe2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DomainDetail, DomainDnsOverview } from "@/lib/domains/dns.types";

export function DomainDnsHeader({
  domain,
  backUrl,
  managed,
  connectionAction,
}: {
  domain: DomainDetail;
  backUrl: string;
  managed: boolean;
  connectionAction?: ReactNode;
}) {
  return (
    <header>
      <Button
        render={<Link href={backUrl} />}
        nativeButton={false}
        variant="ghost"
        size="sm"
        className="-ml-3 text-muted-foreground"
      >
        <ArrowLeft /> Domains
      </Button>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Globe2 className="size-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{domain.hostname}</h1>
              <Badge variant={managed ? "secondary" : "outline"}>
                {managed ? "Multivrs DNS" : "External DNS"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {domain.projectName
                ? `Connected to ${domain.projectName}`
                : "Not connected to a project"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connectionAction}
          <Button
            render={
              <a
                href={`https://${domain.hostname}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">Visit {domain.hostname}</span>
              </a>
            }
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            Visit <ExternalLink />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function DomainStatusCard({
  domain,
  overview,
}: {
  domain: DomainDetail;
  overview: DomainDnsOverview;
}) {
  const items = [
    ["Ownership", domain.verified ? "Verified" : "Pending"],
    ["DNS zone", overview.active ? "Active" : "Not enabled"],
    ["Nameservers", overview.delegated ? "Delegated" : "Pending"],
    ["DNSSEC", overview.dnssec ? "Enabled" : "Off"],
    ["Certificate", domain.certStatus],
  ];
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="size-4 text-emerald-300" />
        <h2 className="text-sm font-medium">Configuration</h2>
      </div>
      <div className="grid gap-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="capitalize text-foreground/80">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
