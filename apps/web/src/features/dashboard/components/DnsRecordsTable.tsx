"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DnsRecord } from "@/lib/domains/dns.types";

interface DnsRecordsTableProps {
  records: DnsRecord[];
  onAdd: () => void;
  onEdit: (record: DnsRecord) => void;
  onRemove: (record: DnsRecord) => void;
}

export function DnsRecordsTable({
  records,
  onAdd,
  onEdit,
  onRemove,
}: DnsRecordsTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.025]">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div>
          <h2 className="text-sm font-medium">DNS records</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {records.length} authoritative{" "}
            {records.length === 1 ? "record" : "records"}
          </p>
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus /> Add record
        </Button>
      </div>
      <div className="hidden grid-cols-[80px_1fr_2fr_100px_44px] gap-4 border-b border-white/6 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:grid">
        <span>Type</span>
        <span>Name</span>
        <span>Value</span>
        <span>TTL</span>
        <span />
      </div>
      {records.length ? (
        records.map((record) => (
          <DnsRecordRow
            key={record.id}
            record={record}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))
      ) : (
        <div className="px-5 py-14 text-center">
          <div className="mx-auto mb-3 size-2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,.8)]" />
          <p className="text-sm font-medium">This zone is ready</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first record to start routing traffic.
          </p>
        </div>
      )}
    </section>
  );
}

function DnsRecordRow({
  record,
  onEdit,
  onRemove,
}: {
  record: DnsRecord;
  onEdit: (record: DnsRecord) => void;
  onRemove: (record: DnsRecord) => void;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr_40px] items-center gap-3 border-b border-white/6 px-5 py-4 last:border-b-0 md:grid-cols-[80px_1fr_2fr_100px_44px] md:gap-4">
      <span className="w-fit rounded-md border border-cyan-400/20 bg-cyan-400/8 px-2 py-1 font-mono text-[11px] font-semibold text-cyan-300">
        {record.type}
      </span>
      <div className="min-w-0">
        <p className="truncate font-mono text-xs">{record.name}</p>
        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground md:hidden">
          {record.value}
        </p>
      </div>
      <p
        className="hidden truncate font-mono text-xs text-foreground/75 md:block"
        title={record.value}
      >
        {record.value}
        {record.priority !== null ? (
          <span className="ml-2 text-muted-foreground">
            prio {record.priority}
          </span>
        ) : null}
      </p>
      <span className="hidden text-xs text-muted-foreground md:block">
        {formatTtl(record.ttl)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" title="Record actions">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(record)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onRemove(record)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function formatTtl(ttl: number): string {
  if (ttl < 3600) return `${ttl / 60} min`;
  if (ttl < 86400) return `${ttl / 3600} hr`;
  return `${ttl / 86400} day`;
}
