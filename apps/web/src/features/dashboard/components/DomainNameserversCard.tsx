"use client";

import { Check, Copy, Network } from "lucide-react";
import { toast } from "sonner";
import type { DomainDnsOverview } from "@/lib/domains/dns.types";

export function DomainNameserversCard({
  overview,
}: {
  overview: DomainDnsOverview;
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-blue-400/10 text-blue-300">
          <Network className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-medium">Authoritative nameservers</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Use these at your registrar to delegate DNS to Multivrs.
          </p>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-white/8">
        {overview.nameservers.map((nameserver, index) => (
          <button
            type="button"
            key={nameserver}
            onClick={() => {
              void navigator.clipboard.writeText(nameserver);
              toast.success("Nameserver copied");
            }}
            className="group flex w-full items-center gap-3 border-b border-white/8 bg-black/20 px-4 py-3 text-left last:border-b-0 hover:bg-white/[0.035]"
          >
            <span className="grid size-5 place-items-center rounded-full border border-white/10 text-[10px] text-muted-foreground">
              {index + 1}
            </span>
            <code className="text-xs text-foreground/80">{nameserver}</code>
            {overview.delegated ? (
              <Check className="ml-auto size-3 text-emerald-400" />
            ) : (
              <Copy className="ml-auto size-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
        {overview.delegated
          ? "Delegation is active across the public DNS."
          : "Nameserver changes can take up to 48 hours to propagate globally."}
      </p>
    </section>
  );
}
