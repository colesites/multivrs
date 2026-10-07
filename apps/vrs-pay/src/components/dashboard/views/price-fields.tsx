import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../context";
import { toMinor } from "../format";
import { Button, Input, NativeSelect } from "../ui";
import { BillingPeriodField, readBillingPeriod } from "./billing-period-field";
import { Field } from "./section-form";

/** Amount, currency and billing period for one price; `prefix` keeps several apart in one form. */
export function PriceFields({
  prefix = "",
  onRemove,
}: {
  prefix?: string;
  onRemove?: () => void;
}) {
  const { session } = useDashboard();
  return (
    <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
      <Field label="Price">
        <Input
          name={`${prefix}amount`}
          required
          inputMode="decimal"
          placeholder="25.00"
        />
      </Field>
      <Field label="Currency">
        <NativeSelect name={`${prefix}currency`} defaultValue="USD">
          {session.currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </NativeSelect>
      </Field>
      <BillingPeriodField prefix={prefix} />
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          aria-label="Remove price"
          className="sm:mt-[26px]"
        >
          <X className="size-4" />
        </Button>
      ) : (
        <span className="hidden size-9 sm:block" />
      )}
    </div>
  );
}

/** One price from PriceFields as an API body, or null when the amount isn't valid. */
export function readPrice(fields: FormData, prefix = "") {
  const currency = String(fields.get(`${prefix}currency`) ?? "USD");
  const amount = toMinor(String(fields.get(`${prefix}amount`) ?? ""), currency);
  if (amount === null) return null;
  return { amount, currency, ...readBillingPeriod(fields, prefix) };
}

/**
 * As many prices as you like: other currencies, billing periods, or
 * several amounts. `read` returns them all, or null if one isn't valid.
 */
export function usePriceRows() {
  const [rows, setRows] = useState([0]);
  const prefixOf = (row: number) => `price-${row}-`;
  const fields = (
    <div className="grid gap-3">
      {rows.map((row) => (
        <PriceFields
          key={row}
          prefix={prefixOf(row)}
          onRemove={
            rows.length > 1
              ? () => setRows(rows.filter((r) => r !== row))
              : undefined
          }
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => setRows([...rows, Math.max(...rows) + 1])}
      >
        <Plus className="size-4" /> Add another price
      </Button>
    </div>
  );
  const read = (form: FormData) => {
    const prices = rows.map((row) => readPrice(form, prefixOf(row)));
    return prices.every((p) => p !== null)
      ? prices.filter((p) => p !== null)
      : null;
  };
  return { fields, read, reset: () => setRows([0]) };
}
