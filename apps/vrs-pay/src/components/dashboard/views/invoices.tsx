import { Badge } from "../badge";
import { useApi } from "../context";
import { formatDate, formatMoney, shortId } from "../format";
import type { Invoice } from "../types";
import {
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Table,
  TableCell,
  TableRow,
} from "../ui";

const REASONS: Record<string, string> = {
  subscription_create: "First period",
  subscription_cycle: "Renewal",
  subscription_update: "Plan change",
};

export function InvoicesView() {
  const { data, error } = useApi<{ data: Invoice[] }>("/v1/invoices");
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="invoices"
        description="One per subscription period, plus one for each prorated upgrade."
      />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="No invoices yet">
          They're created when subscriptions start and renew.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <Table head={["Total", "Status", "For", "Period", "Attempts"]}>
          {data.data.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="px-4">
                <p className="font-mono text-ink">
                  {formatMoney(i.total, i.currency)}
                </p>
                <p className="font-mono text-[11px] text-mute">
                  {shortId(i.id)}
                </p>
              </TableCell>
              <TableCell className="px-4">
                <Badge status={i.status} />
                {i.status === "open" && i.next_attempt_at && (
                  <p className="mt-1 text-xs text-mute">
                    Next try {formatDate(i.next_attempt_at)}
                  </p>
                )}
              </TableCell>
              <TableCell className="px-4 text-ink-soft">
                {REASONS[i.billing_reason] ?? i.billing_reason}
              </TableCell>
              <TableCell className="px-4 text-mute">
                {formatDate(i.period_start)} – {formatDate(i.period_end)}
              </TableCell>
              <TableCell className="px-4 font-mono text-mute">
                {i.attempt_count}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}
