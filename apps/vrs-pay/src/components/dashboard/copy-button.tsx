import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui";

/** Copies `value`; the icon turns into a tick for a moment. */
export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={label}
      className="shrink-0"
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" />
      ) : (
        <Copy className="size-4 text-mute" />
      )}
    </Button>
  );
}
