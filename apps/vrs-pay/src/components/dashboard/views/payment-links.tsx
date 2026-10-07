import { ExternalLink } from "lucide-react";
import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate, formatPrice } from "../format";
import type { List, PaymentLink } from "../types";
import {
  Button,
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { PaymentLinkForm } from "./payment-link-form";

export function PaymentLinksView() {
  const { data, error, reload } =
    useApi<List<PaymentLink>>("/v1/payment_links");
  const { run, pending } = useAction();

  async function turnOff(id: string) {
    await run(`/v1/payment_links/${id}`, { body: { active: false } });
    reload();
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Payment"
        title="links"
        description="Sell a product without writing code: share its link, and each visit opens a secure checkout."
      />
      <PaymentLinkForm onCreated={reload} />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No links yet">
          Links you create show up here, ready to share anywhere.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Product", "Price", "Status", "Created", ""]}>
          {data.data.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="px-4">
                <p className="text-ink">{l.description}</p>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-600 hover:text-brand-700"
                >
                  {l.url.replace(/^https?:\/\//, "")}{" "}
                  <ExternalLink className="size-3" />
                </a>
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap font-mono text-ink">
                {formatPrice(l)}
              </TableCell>
              <TableCell className="px-4">
                <Badge status={l.active ? "active" : "off"} />
              </TableCell>
              <TableCell className="px-4 whitespace-nowrap text-mute">
                {formatDate(l.created)}
              </TableCell>
              <TableCell className="px-4">
                {l.active && (
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => turnOff(l.id)}
                    variant="link"
                    className="h-auto px-0 whitespace-nowrap text-sm text-red-700 hover:text-red-800"
                  >
                    Turn off
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
