import { Badge } from "../badge";
import { useApi } from "../context";
import { formatDateTime, formatMoney, shortId } from "../format";
import type { List, Payment } from "../types";
import {
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { RefundControl } from "./refund-control";

export function PaymentsView() {
  const { data, error, reload } = useApi<List<Payment>>(
    "/v1/payments?limit=100",
  );
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="payments"
        description="Every successful charge: checkouts, renewals and upgrades. Refund all or part of one here."
      />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No payments yet">
          They appear here as soon as a customer pays.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table
          head={[
            "Amount",
            "Status",
            "Customer",
            "Fees (Stripe / VRS)",
            "Date",
            "",
          ]}
        >
          {data.data.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="px-4">
                <p className="font-mono text-ink">
                  {formatMoney(p.amount, p.currency)}
                </p>
                <p className="font-mono text-[11px] text-mute">
                  {shortId(p.id)}
                </p>
              </TableCell>
              <TableCell className="px-4">
                <Badge status={p.status} />
                {p.amount_refunded > 0 && (
                  <p className="mt-1 text-xs text-mute">
                    {formatMoney(p.amount_refunded, p.currency)} refunded
                  </p>
                )}
              </TableCell>
              <TableCell className="px-4 text-ink-soft">
                {p.customer_email ?? "—"}
              </TableCell>
              <TableCell className="px-4 font-mono text-xs text-mute">
                {formatMoney(p.provider_fee, p.currency)} /{" "}
                {formatMoney(p.platform_fee, p.currency)}
              </TableCell>
              <TableCell className="px-4 text-mute">
                {formatDateTime(p.created)}
              </TableCell>
              <TableCell className="px-4">
                <RefundControl payment={p} onDone={reload} />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
