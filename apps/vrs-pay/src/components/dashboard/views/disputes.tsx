import { Badge } from "../badge";
import { useApi } from "../context";
import { formatDate, formatMoney, shortId } from "../format";
import type { Dispute, List } from "../types";
import { Card, Table, TableCell, TableRow } from "../ui";

/** "product_not_received" → "Product not received". */
function reasonLabel(reason: string | null): string {
  if (!reason) return "Not given";
  const words = reason.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Chargebacks on the merchant's payments. Shown only when there are any:
 * what the bank took back and what it costs the balance.
 */
export function Disputes() {
  const { data } = useApi<List<Dispute>>("/v1/disputes?limit=100");
  const disputes = data?.data ?? [];
  if (disputes.length === 0) return null;
  return (
    <Card>
      <p className="text-sm font-medium text-ink">Disputes</p>
      <p className="mt-1 text-sm text-ink-soft">
        A buyer asked their bank to reverse these payments. The amount and the
        bank's dispute fee come out of your balance; if the bank sides with you,
        the amount comes back.
      </p>
      <div className="mt-4">
        <Table
          head={[
            "Payment",
            "Reason",
            "Status",
            "Taken from balance",
            "Evidence due",
          ]}
        >
          {disputes.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="px-4">
                <span className="block text-sm text-ink">
                  {formatMoney(d.amount, d.currency)}
                </span>
                <span className="block font-mono text-xs text-mute">
                  {shortId(d.payment)}
                </span>
              </TableCell>
              <TableCell className="px-4 text-sm text-ink-soft">
                {reasonLabel(d.reason)}
              </TableCell>
              <TableCell className="px-4">
                <Badge status={d.status} />
              </TableCell>
              <TableCell className="px-4 text-sm text-ink">
                {formatMoney(d.amount_withdrawn + d.fee, d.currency)}
                {d.fee > 0 && (
                  <span className="block text-xs text-mute">
                    incl. {formatMoney(d.fee, d.currency)} fee
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 text-sm text-ink-soft">
                {d.evidence_due_by ? formatDate(d.evidence_due_by) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </Card>
  );
}
