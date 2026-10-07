import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../context";
import { toMinor } from "../format";
import { Button, Input, NativeSelect } from "../ui";
import { Field } from "./section-form";

/** What `read` sends on top of the amount, currency and period. */
interface PriceExtras {
  nickname?: string;
  lookup_key?: string;
  currency_options: Record<string, { amount: number }>;
}

/**
 * Stripe's advanced price fields: a description only you see, a lookup
 * key, and the same price in other currencies. `read` returns the body
 * parts, or an error message.
 */
export function usePriceExtras() {
  const { session } = useDashboard();
  const [rows, setRows] = useState<number[]>([]);
  const add = () => setRows([...rows, Math.max(-1, ...rows) + 1]);
  const fields = (
    <div className="grid gap-4">
      {rows.map((row) => (
        <div
          key={row}
          className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] items-end gap-3"
        >
          <Field label="Price in another currency">
            <Input
              name={`option-amount-${row}`}
              required
              inputMode="decimal"
              placeholder="25.00"
            />
          </Field>
          <NativeSelect name={`option-currency-${row}`} defaultValue="EUR">
            {session.currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setRows(rows.filter((r) => r !== row))}
            aria-label="Remove currency"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={add}
      >
        <Plus className="size-4" /> Add a price by currency
      </Button>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price description"
          hint="For you only. Not shown to customers."
        >
          <Input name="nickname" maxLength={250} />
        </Field>
        <Field
          label="Lookup key"
          hint="Optional. Fetch this price by name, e.g. pro_monthly."
        >
          <Input name="lookup_key" maxLength={200} />
        </Field>
      </div>
    </div>
  );
  const read = (form: FormData): PriceExtras | string => {
    const text = (name: string) => String(form.get(name) ?? "").trim();
    const currency_options: PriceExtras["currency_options"] = {};
    for (const row of rows) {
      const currency = text(`option-currency-${row}`);
      const amount = toMinor(text(`option-amount-${row}`), currency);
      if (amount === null) return `Enter an amount above zero for ${currency}.`;
      currency_options[currency.toLowerCase()] = { amount };
    }
    return {
      nickname: text("nickname") || undefined,
      lookup_key: text("lookup_key") || undefined,
      currency_options,
    };
  };
  return { fields, read, reset: () => setRows([]) };
}
