import { type FormEvent, type ReactNode, useState } from "react";
import { useAction } from "../context";
import type { Product } from "../types";
import { Button, Card, ErrorNote, Input, Textarea } from "../ui";
import { usePriceExtras } from "./price-extras-fields";
import { PriceFields, readPrice } from "./price-fields";
import { Field } from "./section-form";

/** A titled card with a form and one button; `submit` returns an error message, if any. */
export function EditCard({
  title,
  description,
  button,
  submit,
  clearOnSuccess = false,
  children,
}: {
  title: string;
  description: string;
  button: string;
  submit: (fields: FormData) => Promise<string | undefined>;
  clearOnSuccess?: boolean;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    const message = await submit(new FormData(form));
    setBusy(false);
    setError(message ?? null);
    if (!message && clearOnSuccess) form.reset();
  }
  return (
    <Card>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-sm text-mute">{description}</p>
        </div>
        {children}
        {error && <ErrorNote message={error} />}
        <Button type="submit" disabled={busy} className="w-fit">
          {button}
        </Button>
      </form>
    </Card>
  );
}

export function AddPriceForm({
  productId,
  onAdded,
}: {
  productId: string;
  onAdded: () => void;
}) {
  const { run } = useAction();
  const extras = usePriceExtras();
  return (
    <EditCard
      title="Add a price"
      description="Prices never change once made, so existing customers keep theirs. To change an amount, add the new price and archive the old one."
      button="Add price"
      clearOnSuccess
      submit={async (fields) => {
        const price = readPrice(fields);
        if (!price) return "Enter a price above zero.";
        const more = extras.read(fields);
        if (typeof more === "string") return more;
        const result = await run("/v1/prices", {
          body: { product: productId, ...price, ...more },
        });
        if (result.error) return result.error;
        extras.reset();
        onAdded();
      }}
    >
      <PriceFields />
      {extras.fields}
    </EditCard>
  );
}

export function ProductDetailsForm({
  product,
  onSaved,
}: {
  product: Product;
  onSaved: () => void;
}) {
  const { run } = useAction();
  return (
    <EditCard
      title="Details"
      description="Shown to customers at checkout and on receipts."
      button="Save"
      submit={async (fields) => {
        const description = String(fields.get("description") ?? "").trim();
        const result = await run(`/v1/products/${product.id}`, {
          body: {
            name: String(fields.get("name") ?? "").trim(),
            description: description || null,
          },
        });
        if (!result.error) onSaved();
        return result.error;
      }}
    >
      <Field label="Name">
        <Input
          name="name"
          required
          maxLength={100}
          defaultValue={product.name}
        />
      </Field>
      <Field label="Description">
        <Textarea
          name="description"
          maxLength={500}
          rows={2}
          defaultValue={product.description ?? ""}
        />
      </Field>
    </EditCard>
  );
}
