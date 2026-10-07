import { useState } from "react";
import { useAction } from "../context";
import { formatPrice } from "../format";
import type { Product } from "../types";
import { Input, NativeSelect } from "../ui";
import { EditCard } from "./product-edit";
import { Field } from "./section-form";

/** Change a price's description or lookup key; its amount never changes. */
export function PriceLabelsForm({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: () => void;
}) {
  const { run } = useAction();
  const [id, setId] = useState(product.prices[0]?.id ?? "");
  const price = product.prices.find((p) => p.id === id);
  if (!price) return null;
  return (
    <EditCard
      title="Price description and lookup key"
      description="Rename a price for your own records, or give it a lookup key."
      button="Save"
      submit={async (fields) => {
        const text = (name: string) => String(fields.get(name) ?? "").trim();
        const result = await run(`/v1/prices/${price.id}`, {
          body: {
            nickname: text("nickname") || null,
            lookup_key: text("lookup_key") || null,
            transfer_lookup_key: fields.get("transfer") === "on",
          },
        });
        if (!result.error) onSaved();
        return result.error;
      }}
    >
      <Field label="Price">
        <NativeSelect value={id} onChange={(e) => setId(e.target.value)}>
          {product.prices.map((p) => (
            <option key={p.id} value={p.id}>
              {formatPrice(p)}
              {p.nickname ? ` · ${p.nickname}` : ""}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <div key={price.id} className="grid gap-4 sm:grid-cols-2">
        <Field label="Price description">
          <Input
            name="nickname"
            maxLength={250}
            defaultValue={price.nickname ?? ""}
          />
        </Field>
        <Field label="Lookup key">
          <Input
            name="lookup_key"
            maxLength={200}
            defaultValue={price.lookup_key ?? ""}
          />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input type="checkbox" name="transfer" className="size-4" />
        If another price has this lookup key, move it here
      </label>
    </EditCard>
  );
}
