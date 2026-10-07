import { type FormEvent, useState } from "react";
import { useAction, useApi, useDashboard } from "../context";
import { allCurrencies, formatPrice } from "../format";
import type { List, Product } from "../types";
import { Button, Card, ErrorNote, Input, NativeSelect } from "../ui";
import { Field, value } from "./section-form";

/**
 * Every price on sale in each of its currencies, labelled with its
 * product. Recurring ones sell a subscription. Values are "price:currency".
 */
function pricesForSale(products: Product[]) {
  return products.flatMap((product) =>
    product.prices
      .filter((p) => p.active)
      .flatMap((p) =>
        allCurrencies(p).map((sold) => ({
          id: `${p.id}:${sold.currency}`,
          label: `${product.name} · ${formatPrice(sold)}`,
        })),
      ),
  );
}

/** Pick a product's price → a new payment link. */
export function PaymentLinkForm({ onCreated }: { onCreated: () => void }) {
  const { navigate } = useDashboard();
  const products = useApi<List<Product>>("/v1/products?active=true");
  const { run, pending } = useAction();
  const [formError, setFormError] = useState<string | null>(null);
  const options = pricesForSale(products.data?.data ?? []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const [price, currency] = (value(fields, "price") ?? "").split(":");
    const result = await run("/v1/payment_links", {
      body: {
        price: price || undefined,
        currency: currency || undefined,
        after_payment_url: value(fields, "after_payment_url"),
      },
    });
    if (result.error) return setFormError(result.error);
    setFormError(null);
    form.reset();
    onCreated();
  }

  if (!products.data) return null;
  if (options.length === 0) {
    return (
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          A payment link sells one of your products. Create a product first.
        </p>
        <Button type="button" onClick={() => navigate("products")}>
          Create a product
        </Button>
      </Card>
    );
  }
  return (
    <Card>
      <form
        onSubmit={create}
        className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-end"
      >
        <Field label="Product">
          <NativeSelect name="price" required>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="After payment, send customers to">
          <Input
            name="after_payment_url"
            type="url"
            placeholder="https://… (optional)"
          />
        </Field>
        <Button type="submit" disabled={pending}>
          Create link
        </Button>
      </form>
      {formError && (
        <div className="mt-3">
          <ErrorNote message={formError} />
        </div>
      )}
    </Card>
  );
}
