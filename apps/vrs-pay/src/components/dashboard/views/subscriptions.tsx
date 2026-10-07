import { Badge } from "../badge";
import { useAction, useApi } from "../context";
import { formatDate, formatPrice, inCurrency, shortId } from "../format";
import type { List, Product, Subscription } from "../types";
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

function SubscriptionActions({
  sub,
  onDone,
}: {
  sub: Subscription;
  onDone: () => void;
}) {
  const { run, pending } = useAction();
  if (sub.status === "canceled" || sub.status === "incomplete") return null;
  const act = async (path: string, body: object = {}) => {
    const result = await run(`/v1/subscriptions/${sub.id}${path}`, { body });
    if (!result.error) onDone();
  };
  const link = "h-auto px-0 text-brand-600 hover:text-brand-700";
  return sub.cancel_at_period_end ? (
    <Button
      variant="link"
      disabled={pending}
      onClick={() => act("/resume")}
      className={link}
    >
      Resume
    </Button>
  ) : (
    <Button
      variant="link"
      disabled={pending}
      onClick={() => act("/cancel", { at: "period_end" })}
      className={link}
    >
      Cancel at period end
    </Button>
  );
}

export function SubscriptionsView() {
  const subs = useApi<List<Subscription>>("/v1/subscriptions");
  const plans = useApi<List<Product>>("/v1/products");
  const planOf = (id: string) => plans.data?.data.find((p) => p.id === id);
  const priceOf = (planId: string, priceId: string) =>
    planOf(planId)?.prices.find((p) => p.id === priceId);
  const error = subs.error ?? plans.error;
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="subscriptions"
        description="VRS Pay renews them, retries failed cards (1, 3, 5 and 7 days later) and cancels after the last try."
      />
      {error && <ErrorNote message={error} />}
      {(!subs.data || !plans.data) && !error && <Loading />}
      {subs.data && plans.data && subs.data.data.length === 0 && (
        <Empty title="No subscriptions yet">
          Start one with a checkout session in subscription mode, or the drop-in
          pricing table.
        </Empty>
      )}
      {subs.data && plans.data && subs.data.data.length > 0 && (
        <Table head={["Plan", "Status", "Amount", "Renews", "Customer", ""]}>
          {subs.data.data.map((s) => {
            const price = priceOf(s.plan, s.price);
            return (
              <TableRow key={s.id}>
                <TableCell className="px-4">
                  <p className="text-ink">
                    {planOf(s.plan)?.name ?? "Unknown plan"}
                    {s.quantity > 1 ? ` × ${s.quantity}` : ""}
                  </p>
                  <p className="font-mono text-[11px] text-mute">
                    {shortId(s.id)}
                  </p>
                </TableCell>
                <TableCell className="px-4">
                  <Badge status={s.status} />
                  {s.cancel_at_period_end && (
                    <p className="mt-1 text-xs text-mute">
                      Cancels at period end
                    </p>
                  )}
                  {s.pending_price && (
                    <p className="mt-1 text-xs text-mute">
                      Downgrade at period end
                    </p>
                  )}
                </TableCell>
                <TableCell className="px-4 font-mono text-ink-soft">
                  {price
                    ? formatPrice(inCurrency(price, s.currency), s.quantity)
                    : "—"}
                </TableCell>
                <TableCell className="px-4 text-mute">
                  {formatDate(s.current_period_end)}
                </TableCell>
                <TableCell className="px-4 font-mono text-xs text-mute">
                  {shortId(s.customer)}
                </TableCell>
                <TableCell className="px-4">
                  <SubscriptionActions sub={s} onDone={subs.reload} />
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      )}
    </div>
  );
}
