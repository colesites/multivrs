"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type DnsRecordInput,
  dnsRequest,
  enableDns,
} from "@/features/dashboard/domain-dns-api";
import type {
  DnsRecord,
  DomainDetail,
  DomainDnsOverview,
} from "@/lib/domains/dns.types";

export function useDomainDns(
  domain: DomainDetail,
  initialOverview: DomainDnsOverview,
) {
  const [overview, setOverview] = useState(initialOverview);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DnsRecord>();
  const [pending, startTransition] = useTransition();

  function save(record: DnsRecordInput) {
    startTransition(async () => {
      try {
        const next = editing
          ? await dnsRequest(domain.id, "PATCH", {
              original: toInput(editing),
              record,
            })
          : await dnsRequest(domain.id, "POST", record);
        setOverview(next);
        setEditorOpen(false);
        setEditing(undefined);
        toast.success(editing ? "DNS record updated" : "DNS record added");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save record",
        );
      }
    });
  }

  function remove(record: DnsRecord) {
    if (!window.confirm(`Delete the ${record.type} record for ${record.name}?`))
      return;
    startTransition(async () => {
      try {
        setOverview(
          await dnsRequest(domain.id, "DELETE", { record: toInput(record) }),
        );
        toast.success("DNS record deleted");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to delete record",
        );
      }
    });
  }

  async function addVerification() {
    setOverview(
      await dnsRequest(domain.id, "POST", {
        name: "_multivrs",
        type: "TXT",
        value: domain.verificationValue,
        ttl: 900,
        priority: null,
      }),
    );
  }

  async function enable() {
    setOverview(await enableDns(domain.id));
  }

  return {
    overview,
    editorOpen,
    setEditorOpen,
    editing,
    setEditing,
    pending,
    save,
    remove,
    addVerification,
    enable,
  };
}

function toInput(record: DnsRecord): DnsRecordInput {
  return {
    name: record.name,
    type: record.type,
    value: record.value,
    ttl: record.ttl,
    priority: record.priority,
  };
}
