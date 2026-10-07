import { useApi, useDashboard } from "../context";
import { formatMoney } from "../format";
import type { Balance } from "../types";
import { Button, Card, Empty, ErrorNote, Loading, PageHeader } from "../ui";

export function BalanceView() {
  const { session, navigate } = useDashboard();
  const { data, error } = useApi<Balance>("/balance");
  const active = session.setup.status === "active";
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Your"
        title="balance"
        description="What we owe you after our fee. Each sale is held for a few days (for refunds and chargebacks), then it's ready to pay out."
      />
      {error && <ErrorNote message={error} />}
      {!data && !error && <Loading />}
      {data && data.data.length === 0 && (
        <Empty title="Nothing yet">
          Your balance grows with every payment.
        </Empty>
      )}
      {data && data.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.data.map((b) => (
            <Card key={b.currency}>
              <p className="text-xs font-medium text-mute">
                {b.currency.toUpperCase()}
              </p>
              <p className="mt-2 font-mono text-[1.6rem] tracking-tight text-ink">
                {formatMoney(b.available, b.currency)}
              </p>
              <p className="text-xs text-mute">available</p>
              <p className="mt-3 font-mono text-sm text-ink-soft">
                {formatMoney(b.pending, b.currency)}
              </p>
              <p className="text-xs text-mute">
                pending ({data.hold_days}-day hold)
              </p>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <p className="text-sm font-medium text-ink">Payouts</p>
        {active ? (
          <p className="mt-1 text-sm text-ink-soft">
            Your available balance is paid to the bank account you connected in
            Account setup.
          </p>
        ) : (
          <p className="mt-1 text-sm text-ink-soft">
            Payouts start once your account setup is complete.{" "}
            <Button
              type="button"
              onClick={() => navigate("setup")}
              variant="link"
              className="h-auto px-0 font-medium text-brand-600 hover:text-brand-700"
            >
              Finish setting up
            </Button>
          </p>
        )}
      </Card>
    </div>
  );
}
