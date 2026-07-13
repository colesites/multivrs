"use client";

import { ExternalLink, MoreHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardDomain } from "@/lib/services/domain.service";

export function DomainRow({ domain }: { domain: DashboardDomain }) {
  return (
    <div className="group flex min-h-20 items-center gap-4 border-b border-border px-4 last:border-b-0 hover:bg-white/[0.02]">
      <div className="min-w-0 flex-1">
        <a href={`https://${domain.name}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 truncate text-sm font-medium hover:underline">
          {domain.name}<ExternalLink className="size-3 opacity-0 group-hover:opacity-50" />
        </a>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {domain.managed ? <><RefreshCw className="size-3" /> Auto-renew {domain.renewalLabel}</> : "Third party"}
        </p>
      </div>
      <span className="hidden text-xs text-muted-foreground sm:block">{domain.project}</span>
      <span className="w-20 text-right text-xs text-muted-foreground">{domain.status}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Domain actions"><MoreHorizontal /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View DNS</DropdownMenuItem>
          <DropdownMenuItem>Verify configuration</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
