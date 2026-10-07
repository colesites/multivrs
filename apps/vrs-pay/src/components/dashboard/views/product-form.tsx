import { type FormEvent, useState } from "react";
import { useAction } from "../context";
import type { Product } from "../types";
import { Button, ErrorNote, Input, Textarea } from "../ui";
import { usePriceRows } from "./price-fields";
import { Field, value } from "./section-form";

/** Name, description and one or more prices → a new product. */
export function ProductForm({
  onCreated,
  onCancel,
}: {
  onCreated: (product: Product) => void;
  onCancel?: () => void;
}) {
  const { run, pending } = useAction();
  const [error, setError] = useState<string | null>(null);
  const prices = usePriceRows();

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const list = prices.read(fields);
    if (!list) return setError("Enter an amount above zero for every price.");
    const result = await run<Product>("/v1/products", {
      body: {
        name: value(fields, "name"),
        description: value(fields, "description"),
        prices: list,
      },
    });
    if (result.error) return setError(result.error);
    setError(null);
    form.reset();
    prices.reset();
    if (result.data) onCreated(result.data);
  }

  return (
    <form onSubmit={create} className="grid gap-4">
      <Field
        label="Name"
        hint="Customers see this at checkout and on receipts."
      >
        <Input
          name="name"
          required
          maxLength={100}
          placeholder="e.g. Pro plan, Design e-book, Consultation"
        />
      </Field>
      <Field label="Description" hint="Optional.">
        <Textarea name="description" maxLength={500} rows={2} />
      </Field>
      {prices.fields}
      {error && <ErrorNote message={error} />}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          Create product
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
