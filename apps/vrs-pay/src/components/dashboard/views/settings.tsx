import { type FormEvent, useState } from "react";
import { useAction, useDashboard } from "../context";
import { formatMoney } from "../format";
import { Button, Card, ErrorNote, Input, PageHeader } from "../ui";
import { Profile, SignInMethods } from "./settings-account";

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

const percent = (bps: number) => `${(bps / 100).toFixed(1)}%`;

/**
 * What VRS Pay charges per payment: one rate plus a small fixed part per
 * currency, and a conversion fee in currencies that have to be converted.
 */
function Fees() {
  const { session } = useDashboard();
  const { platform_fee_bps, fixed_fees } = session.merchant;
  const conversion = session.merchant.conversion_fee_bps ?? 0;
  const converted = new Set(session.merchant.converted_currencies ?? []);
  const shownConverted = SHOWN.filter((c) => converted.has(c));
  return (
    <Card>
      <p className="text-sm font-medium text-ink">Pricing</p>
      <p className="mt-1 text-sm text-ink-soft">
        {percent(platform_fee_bps)} + a small fixed fee per successful payment.
        It covers card processing and payouts — no monthly fees.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SHOWN.map((currency) => (
          <li
            key={currency}
            className="rounded-full bg-wash px-3 py-1 font-mono text-xs text-ink"
          >
            {currency}{" "}
            {percent(
              platform_fee_bps + (converted.has(currency) ? conversion : 0),
            )}{" "}
            + {formatMoney(fixed_fees[currency] ?? 0, currency)}
          </li>
        ))}
      </ul>
      {conversion > 0 && shownConverted.length > 0 && (
        <p className="mt-3 text-xs text-mute">
          Includes {percent(conversion)} for currency conversion on{" "}
          {shownConverted.join(", ")} payments.
        </p>
      )}
    </Card>
  );
}

export function SettingsView() {
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Settings"
        title=""
        description="Your profile, how you sign in, your business and pricing."
      />
      <Profile />
      <SignInMethods />
      <BusinessName />
      <Fees />
    </div>
  );
}
