import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "../badge";
import { useApi } from "../context";
import { formatDate, formatPrice } from "../format";
import type { List, Product } from "../types";
import {
  Button,
  Card,
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { PlanSync } from "./plan-sync";
import { ProductDetail } from "./product-detail";
import { ProductForm } from "./product-form";

function pricing(product: Product): string {
  const active = product.prices.filter((p) => p.active);
  if (active.length === 0) return "No active prices";
  const first = active[0] ? formatPrice(active[0]) : "";
  return active.length > 1 ? `${first} and ${active.length - 1} more` : first;
}

export function ProductsView() {
  const { data, error, reload } = useApi<List<Product>>("/v1/products");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const product = data?.data.find((p) => p.id === selected);
  if (product) {
    return (
      <ProductDetail
        product={product}
        onBack={() => setSelected(null)}
        onChanged={reload}
      />
    );
  }
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="products"
        description="Everything you sell. Each product has a name, a description and one or more prices, charged once or on a schedule."
        action={
          !creating && (
            <Button type="button" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Create product
            </Button>
          )
        }
      />
      {creating && (
        <Card>
          <p className="mb-4 text-sm font-medium text-ink">New product</p>
          <ProductForm
            onCreated={(p) => {
              setCreating(false);
              setSelected(p.id);
              reload();
            }}
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && !creating && (
        <Empty title="No products yet">
          Create your first product: give it a name, a description and a price.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Product", "Pricing", "Status", "Created"]}>
          {data.data.map((p) => (
            <TableRow
              key={p.id}
              onClick={() => setSelected(p.id)}
              className="cursor-pointer hover:bg-wash/60"
            >
              <TableCell className="px-4">
                <p className="font-medium text-ink">{p.name}</p>
                <p className="line-clamp-1 text-xs text-mute">
                  {p.source === "config"
                    ? "From vrs-pay.config.ts"
                    : (p.description ?? "")}
                </p>
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap font-mono text-ink-soft">
                {pricing(p)}
              </TableCell>
              <TableCell className="px-4">
                <Badge status={p.active ? "active" : "archived"} />
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap text-mute">
                {formatDate(p.created)}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
      <details className="group">
        <summary className="cursor-pointer text-sm text-mute hover:text-ink">
          Using vrs-pay.config.ts? Sync your plans here.
        </summary>
        <div className="mt-4">
          <PlanSync onSynced={reload} />
        </div>
      </details>
    </div>
  );
}
