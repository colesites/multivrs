import { useState } from "react";
import { useAction, useDashboard } from "../context";
import type { Product } from "../types";
import { Button } from "../ui";

/** Stripe's "Copy to live mode": the product and its active prices, made again in live mode. */
export function CopyToLiveButton({ product }: { product: Product }) {
  const { session } = useDashboard();
  const { run, pending } = useAction();
  const [note, setNote] = useState<string | null>(null);
  if (session.mode !== "test" || product.source !== "dashboard") return null;

  async function copy() {
    const result = await run<Product>(`/products/${product.id}/copy-to-live`, {
      body: {},
    });
    setNote(result.error ?? "Copied. Switch to live mode to see it.");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {note && <span className="text-sm text-mute">{note}</span>}
      <Button
        type="button"
        disabled={pending}
        onClick={() => void copy()}
        variant="outline"
      >
        Copy to live mode
      </Button>
    </div>
  );
}
