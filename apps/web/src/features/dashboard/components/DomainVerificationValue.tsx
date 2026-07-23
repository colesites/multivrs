"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

interface DomainVerificationValueProps {
  label: string;
  value: string;
  copy?: boolean;
}

export function DomainVerificationValue({
  label,
  value,
  copy = false,
}: DomainVerificationValueProps) {
  return (
    <div className="min-w-0 bg-black/25 p-3">
      <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 truncate text-[11px] text-foreground/80">
          {value}
        </code>
        {copy ? (
          <button
            type="button"
            aria-label={`Copy ${label}`}
            onClick={() => {
              void navigator.clipboard.writeText(value);
              toast.success(`${label} copied`);
            }}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <Copy className="size-3" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
