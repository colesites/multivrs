"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DNS_RECORD_TYPES,
  DNS_TTL_OPTIONS,
  type DnsRecordType,
} from "@/lib/domains/dns.types";

interface DnsRecordFieldsProps {
  name: string;
  setName: (value: string) => void;
  type: DnsRecordType;
  setType: (value: DnsRecordType) => void;
  value: string;
  setValue: (value: string) => void;
  ttl: number;
  setTtl: (value: number) => void;
  priority: string;
  setPriority: (value: string) => void;
}

export function DnsRecordFields(props: DnsRecordFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Type">
        <Select
          value={props.type}
          onValueChange={(value) => props.setType(value as DnsRecordType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DNS_RECORD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Name">
        <Input
          value={props.name}
          onChange={(event) => props.setName(event.target.value)}
          placeholder="@"
          required
        />
      </Field>
      <div className="col-span-2">
        <Field label="Value">
          <Input
            value={props.value}
            onChange={(event) => props.setValue(event.target.value)}
            placeholder={placeholder(props.type)}
            required
          />
        </Field>
      </div>
      {props.type === "MX" || props.type === "SRV" ? (
        <Field label="Priority">
          <Input
            type="number"
            min={0}
            max={65535}
            value={props.priority}
            onChange={(event) => props.setPriority(event.target.value)}
            required
          />
        </Field>
      ) : null}
      <Field label="TTL">
        <Select
          value={String(props.ttl)}
          onValueChange={(value) => props.setTtl(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DNS_TTL_OPTIONS.map((ttl) => (
              <SelectItem key={ttl} value={String(ttl)}>
                {formatTtl(ttl)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function formatTtl(seconds: number): string {
  if (seconds < 3600) return `${seconds / 60} min`;
  return `${seconds / 3600} hr`;
}

function placeholder(type: DnsRecordType): string {
  if (type === "A") return "76.76.21.21";
  if (type === "AAAA") return "2001:db8::1";
  if (type === "MX") return "mail.example.com";
  if (type === "TXT") return "v=spf1 include:example.com ~all";
  return "target.example.com";
}
