"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MailDashboardData } from "@/features/mail/mail.types";

export function FormField({
  name,
  placeholder,
  required = true,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="capitalize text-white/45" htmlFor={name}>
        {name.replace(/([A-Z])/g, " $1")}
      </Label>
      <Input
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  );
}

export function FormArea({
  name,
  placeholder,
}: {
  name: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="capitalize text-white/45" htmlFor={name}>
        {name}
      </Label>
      <Textarea
        className="min-h-36"
        id={name}
        name={name}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export function FormChoice({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  return (
    <label className="space-y-1.5">
      <Label className="capitalize text-white/45">{name}</Label>
      <select
        className="h-10 w-full rounded-lg border border-white/10 bg-[#0b0c10] px-3 text-sm capitalize"
        name={name}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function AudienceChoice({
  data,
  optional = false,
}: {
  data: MailDashboardData;
  optional?: boolean;
}) {
  return (
    <label className="space-y-1.5">
      <Label className="text-white/45">
        Audience{optional ? " (optional)" : ""}
      </Label>
      <select
        className="h-10 w-full rounded-lg border border-white/10 bg-[#0b0c10] px-3 text-sm"
        name="audienceId"
        required={!optional}
      >
        <option value="">{optional ? "No audience" : "Select audience"}</option>
        {data.resources.audiences.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ComposeField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] text-white/45">{label}</Label>
      {children}
    </div>
  );
}
