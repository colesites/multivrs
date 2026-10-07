import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui";

/** A just-created secret, shown once with a copy button. */
export function SecretReveal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">{label}</p>
      <p className="mt-1 text-xs text-amber-800">
        Copy it now. For your security it won't be shown again.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 font-mono text-xs text-ink ring-1 ring-amber-200">
          {value}
        </code>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={copy}
          aria-label="Copy"
          className="shrink-0 border-amber-200 bg-white"
        >
          {copied ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Copy className="size-4 text-amber-900" />
          )}
        </Button>
      </div>
    </div>
  );
}
