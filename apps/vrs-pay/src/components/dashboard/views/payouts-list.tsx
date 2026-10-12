import { Badge } from "../badge";
import { formatDateTime, formatMoney } from "../format";
import type { Payout, PayoutSchedule } from "../types";
import { Card, Table, TableCell, TableRow } from "../ui";

/** "Daily, once at least ₦5,000.00 is available", or why payouts can't go yet. */
export function scheduleLine(schedule: PayoutSchedule | undefined): string {
  if (!schedule) return "";
  if (!schedule.ready || !schedule.currency || schedule.minimum === null) {
    return schedule.reason ?? "";
  }
  return `Paid daily once at least ${formatMoney(schedule.minimum, schedule.currency)} is available. The bank transfer fee comes out of each payout.`;
}

/** The merchant's payouts, newest first. */
export function PayoutsList({
  payouts,
  schedule,
}: {
  payouts: Payout[];
  schedule: PayoutSchedule | undefined;
}) {
  if (payouts.length === 0) {
    return (
      <Card className="py-12 text-center border-line/70 bg-white">
        <p className="text-sm font-semibold text-ink">No payouts yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-mute">
          {scheduleLine(schedule)}
        </p>
      </Card>
    );
  }
  return (
    <div className="grid gap-2">
      <p className="text-xs text-mute">{scheduleLine(schedule)}</p>
      <Table head={["Date", "Sent", "Fee", "Status", "To"]}>
        {payouts.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="px-4 text-xs text-ink-soft whitespace-nowrap">
              {formatDateTime(p.created)}
            </TableCell>
            <TableCell className="px-4 text-sm text-ink">
              {formatMoney(p.amount, p.currency)}
            </TableCell>
            <TableCell className="px-4 text-xs text-mute">
              {formatMoney(p.fee, p.currency)}
            </TableCell>
            <TableCell className="px-4">
              <Badge status={p.status} />
              {p.failure_message && (
                <span className="mt-1 block max-w-[16rem] text-xs text-red-700">
                  {p.failure_message} The money is back in your balance.
                </span>
              )}
            </TableCell>
            <TableCell className="px-4 text-xs text-ink-soft">
              {p.destination.bank_name ?? "Bank"}{" "}
              {p.destination.last4 ? `•••• ${p.destination.last4}` : ""}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
