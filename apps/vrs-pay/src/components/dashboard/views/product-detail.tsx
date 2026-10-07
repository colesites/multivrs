import { ArrowLeft } from "lucide-react";
import { Badge } from "../badge";
import { useAction, useDashboard } from "../context";
import { billingLabel, formatDate, formatPrice } from "../format";
import type { PaymentLink, Product, ProductPrice } from "../types";
import {
  Button,
  Card,
  ErrorNote,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { AddPriceForm, ProductDetailsForm } from "./product-edit";

/** One product: its prices (add, archive, sell with a link) and its details. */
export function ProductDetail({
  product,
  onBack,
  onChanged,
}: {
  product: Product;
  onBack: () => void;
  onChanged: () => void;
}) {
  const { navigate } = useDashboard();
  const { run, pending } = useAction();
  const editable = product.source === "dashboard";

  async function setActive(path: string, active: boolean) {
    await run(path, { body: { active } });
    onChanged();
  }
  async function sellWithLink(price: ProductPrice) {
    const result = await run<PaymentLink>("/v1/payment_links", {
      body: { price: price.id },
    });
    if (!result.error) navigate("links");
  }

  return (
    <div className="grid gap-6">
      <Button
        type="button"
        onClick={onBack}
        variant="link"
        className="h-auto px-0 inline-flex w-fit items-center gap-1.5 text-sm text-mute hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Products
      </Button>
      <PageHeader
        title={product.name}
        description={product.description ?? undefined}
        action={
          editable && (
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                setActive(`/v1/products/${product.id}`, !product.active)
              }
              variant="outline"
            >
              {product.active ? "Archive product" : "Restore product"}
            </Button>
          )
        }
      />
      {!product.active && (
        <ErrorNote message="Archived: customers can't buy it, and its payment links are off." />
      )}
      {!editable && (
        <Card className="text-sm text-ink-soft">
          This product comes from your vrs-pay.config.ts. Change it there and
          sync.
        </Card>
      )}
      <Table head={["Price", "Billing", "Status", "Created", ""]}>
        {product.prices.map((price) => (
          <TableRow key={price.id}>
            <TableCell className="px-4 whitespace-nowrap font-mono text-ink">
              {formatPrice(price)}
            </TableCell>
            <TableCell className="px-4 whitespace-nowrap text-ink-soft">
              {billingLabel(price)}
            </TableCell>
            <TableCell className="px-4">
              <Badge status={price.active ? "active" : "archived"} />
            </TableCell>
            <TableCell className="px-4 whitespace-nowrap text-mute">
              {formatDate(price.created)}
            </TableCell>
            <TableCell className="px-4 text-right whitespace-nowrap">
              {price.active && product.active && (
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() => sellWithLink(price)}
                  variant="link"
                  className="h-auto px-0 mr-4 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Create payment link
                </Button>
              )}
              {editable && (
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    setActive(`/v1/prices/${price.id}`, !price.active)
                  }
                  variant="link"
                  className="h-auto px-0 text-sm text-mute hover:text-ink"
                >
                  {price.active ? "Archive" : "Restore"}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </Table>
      {editable && (
        <>
          <AddPriceForm productId={product.id} onAdded={onChanged} />
          <ProductDetailsForm product={product} onSaved={onChanged} />
        </>
      )}
    </div>
  );
}
