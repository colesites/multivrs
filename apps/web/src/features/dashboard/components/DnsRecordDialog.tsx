"use client";

import { useReducer } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DnsRecordInput } from "@/features/dashboard/domain-dns-api";
import type { DnsRecord, DnsRecordType } from "@/lib/domains/dns.types";
import { DnsRecordFields } from "./DnsRecordFields";

interface DnsRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: DnsRecord;
  pending: boolean;
  onSubmit: (record: DnsRecordInput) => void;
}

export function DnsRecordDialog({
  open,
  onOpenChange,
  record,
  pending,
  onSubmit,
}: DnsRecordDialogProps) {
  const [state, update] = useReducer(
    (current: RecordFormState, patch: Partial<RecordFormState>) => ({
      ...current,
      ...patch,
    }),
    record,
    initialState,
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: state.name,
      type: state.type,
      value: state.value,
      ttl: state.ttl,
      priority:
        state.type === "MX" || state.type === "SRV"
          ? Number(state.priority)
          : null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>
              {record ? "Edit DNS record" : "Add DNS record"}
            </DialogTitle>
            <DialogDescription>
              Changes are published to Openprovider authoritative DNS.
            </DialogDescription>
          </DialogHeader>
          <DnsRecordFields
            name={state.name}
            setName={(name) => update({ name })}
            type={state.type}
            setType={(type) => update({ type })}
            value={state.value}
            setValue={(value) => update({ value })}
            ttl={state.ttl}
            setTtl={(ttl) => update({ ttl })}
            priority={state.priority}
            setPriority={(priority) => update({ priority })}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RecordFormState {
  name: string;
  type: DnsRecordType;
  value: string;
  ttl: number;
  priority: string;
}

function initialState(record?: DnsRecord): RecordFormState {
  return {
    name: record?.name ?? "@",
    type: record?.type ?? "A",
    value: record?.value ?? "",
    ttl: record?.ttl ?? 3600,
    priority: String(record?.priority ?? 10),
  };
}
