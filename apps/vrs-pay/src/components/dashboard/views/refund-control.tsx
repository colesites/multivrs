import { useState } from "react";
import { useAction } from "../context";
import { toMajor, toMinor } from "../format";
import type { Payment } from "../types";
import { Button, Input } from "../ui";

export function RefundControl({
  payment,
  onDone,
}: {
  payment: Payment;
  onDone: () => void;
}) {
  const remaining = payment.amount - payment.amount_refunded;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(toMajor(remaining, payment.currency));
  const [error, setError] = useState<string | null>(null);
  const { run, pending } = useAction();
  if (remaining <= 0) return null;
  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="link"
        className="h-auto px-0 text-sm text-brand-600 hover:text-brand-700"
      >
        Refund
      </Button>
    );
  }
  async function submit() {
    const amount = toMinor(value, payment.currency);
    if (amount === null) return setError("Enter an amount.");
    const result = await run("/v1/refunds", {
      body: { payment: payment.id, amount },
    });
    if (result.error) return setError(result.error);
    setOpen(false);
    onDone();
  }
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          aria-label="Refund amount"
          className="h-8 w-24"
        />
        <Button
          type="button"
          disabled={pending}
          onClick={submit}
          variant="outline"
          className="h-8"
        >
          Refund
        </Button>
        <Button
          type="button"
          onClick={() => setOpen(false)}
          variant="link"
          className="h-auto px-0 text-xs text-mute"
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
