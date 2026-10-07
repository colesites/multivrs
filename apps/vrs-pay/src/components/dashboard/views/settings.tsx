import { type FormEvent, useState } from "react";
import { useAction, useDashboard } from "../context";
import { formatMoney } from "../format";
import { Button, Card, ErrorNote, Input, PageHeader } from "../ui";

function BusinessName() {
  const { session, refreshSession } = useDashboard();
  const { run, pending } = useAction();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    const result = await run("/merchant", { body: { name } });
    if (result.error) return setError(result.error);
    setError(null);
    setSaved(true);
    await refreshSession();
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Business</p>
      <form onSubmit={save} className="mt-3 flex flex-wrap gap-2">
        <Input
          name="name"
          defaultValue={session.merchant.name}
          required
          maxLength={100}
          aria-label="Business name"
          className="min-w-0 flex-1"
        />
        <Button type="submit" disabled={pending}>
          Save
        </Button>
      </form>
      {saved && <p className="mt-2 text-sm text-emerald-700">Saved.</p>}
      {error && (
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      )}
      <dl className="mt-4 grid gap-1 font-mono text-xs text-mute">
        <div>
          <dt className="inline">Merchant id: </dt>
          <dd className="inline text-ink-soft">{session.merchant.id}</dd>
        </div>
        <div>
          <dt className="inline">Mode: </dt>
          <dd className="inline text-ink-soft">{session.mode}</dd>
        </div>
      </dl>
    </Card>
  );
}

const SHOWN = ["GBP", "USD", "EUR", "NGN", "GHS", "KES", "ZAR"];

/** What VRS Pay charges per payment: one rate plus a small fixed part per currency. */
function Fees() {
  const { session } = useDashboard();
  const rate = `${(session.merchant.platform_fee_bps / 100).toFixed(1)}%`;
  return (
    <Card>
      <p className="text-sm font-medium text-ink">Pricing</p>
      <p className="mt-1 text-sm text-ink-soft">
        {rate} + a small fixed fee per successful payment. It covers card
        processing, currency conversion and payouts — no monthly fees.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SHOWN.map((currency) => (
          <li
            key={currency}
            className="rounded-full bg-wash px-3 py-1 font-mono text-xs text-ink"
          >
            {rate} +{" "}
            {formatMoney(session.merchant.fixed_fees[currency] ?? 0, currency)}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function SettingsView() {
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Settings"
        title=""
        description="Your business name and pricing."
      />
      <Fees />
      <BusinessName />
    </div>
  );
}
