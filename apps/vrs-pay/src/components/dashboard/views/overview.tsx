import { Badge } from "../badge";
import { useApi, useDashboard } from "../context";
import { formatDateTime, formatMoney } from "../format";
import { RevenueChart } from "../revenue-chart";
import type { Overview } from "../types";
import {
  Card,
  Empty,
  ErrorNote,
  Loading,
  PageHeader,
  Stat,
  Table,
  TableCell,
  TableRow,
} from "../ui";
import { SetupBanner } from "./setup-banner";

export function OverviewView() {
  const { session } = useDashboard();
  const { data, error } = useApi<Overview>("/overview");
  const firstName = session.user.name.split(" ")[0];
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Welcome,"
        title={firstName ?? ""}
        description="The last 30 days across your account."
      />
      <SetupBanner />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && <OverviewBody data={data} />}
    </div>
  );
}

function OverviewBody({ data }: { data: Overview }) {
  const main = data.totals[0];
  const currency = data.currency;
  const mrr = data.mrr.find((m) => m.currency === currency) ?? data.mrr[0];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Gross volume"
          value={formatMoney(main?.gross ?? 0, currency)}
          hint={`${main?.payments ?? 0} payments`}
        />
        <Stat
          label="Net revenue"
          value={formatMoney(main?.net ?? 0, currency)}
          hint="After refunds and fees"
        />
        <Stat
          label="MRR"
          value={formatMoney(mrr?.amount ?? 0, mrr?.currency ?? currency)}
          hint={`${data.subscriptions.active} active subscriptions`}
        />
        <Stat
          label="Customers"
          value={String(data.customers.total)}
          hint={`${data.customers.new_30d} new this month`}
        />
      </div>
      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-ink">Revenue</p>
          <p className="font-mono text-xs text-mute">
            {currency.toUpperCase()} · daily
          </p>
        </div>
        <div className="mt-4">
          <RevenueChart daily={data.daily} currency={currency} />
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Trialing" value={String(data.subscriptions.trialing)} />
        <Stat
          label="Past due"
          value={String(data.subscriptions.past_due)}
          hint="Retrying the card on a schedule"
        />
        <Stat
          label="Canceled (30 days)"
          value={String(data.subscriptions.canceled_30d)}
        />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-ink">Recent payments</p>
        {data.recent_payments.length === 0 ? (
          <Empty title="No payments yet">
            Create a checkout session with your secret key, or share a payment
            link.
          </Empty>
        ) : (
          <Table head={["Amount", "Status", "Customer", "Date"]}>
            {data.recent_payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="px-4 font-mono">
                  {formatMoney(p.amount, p.currency)}
                </TableCell>
                <TableCell className="px-4">
                  <Badge status={p.status} />
                </TableCell>
                <TableCell className="px-4 text-ink-soft">
                  {p.customer_email ?? "—"}
                </TableCell>
                <TableCell className="px-4 text-mute">
                  {formatDateTime(p.created)}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </>
  );
}
