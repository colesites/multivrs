import {
  type CustomerOverview,
  type CustomerSubscription,
  formatAmount,
  formatPrice,
} from "@vrs-pay/js";

export interface CustomerPortalViewProps {
  overview: CustomerOverview;
  onCancel: (subscription: CustomerSubscription) => void;
  onResume: (subscription: CustomerSubscription) => void;
  /** The subscription being changed. */
  busy?: string | null;
  error?: string | null;
  locale?: string;
  className?: string;
}

const STATUS: Record<CustomerSubscription["status"], string> = {
  incomplete: "Incomplete",
  trialing: "Trial",
  active: "Active",
  past_due: "Payment due",
  canceled: "Canceled",
};

const day = (seconds: number, locale?: string) =>
  new Date(seconds * 1000).toLocaleDateString(locale, { dateStyle: "medium" });

/** When the subscription next changes: trial end, renewal or cancellation. */
function nextDate(sub: CustomerSubscription, locale?: string): string | null {
  if (sub.status === "canceled") return null;
  if (sub.status === "trialing" && sub.trial_end) return `Trial ends ${day(sub.trial_end, locale)}`;
  if (!sub.current_period_end) return null;
  const when = day(sub.current_period_end, locale);
  return sub.cancel_at_period_end ? `Ends ${when}` : `Renews ${when}`;
}

/** The customer portal's markup, without data loading: style it with the `vrs-` classes. */
export function CustomerPortalView(props: CustomerPortalViewProps) {
  const { overview, busy, error, locale } = props;
  const live = overview.subscriptions.filter((s) => s.status !== "canceled");
  return (
    <div className={`vrs-portal ${props.className ?? ""}`.trim()}>
      {error && <p className="vrs-error">{error}</p>}
      <section className="vrs-portal-section">
        <h3 className="vrs-portal-heading">Your plan</h3>
        {live.length === 0 && <p className="vrs-muted">You don't have a subscription.</p>}
        {live.map((sub) => (
          <div key={sub.id} className="vrs-subscription">
            <div>
              <p className="vrs-subscription-name">
                {sub.product_name ?? "Subscription"}
                <span className={`vrs-status vrs-status-${sub.status}`}>{STATUS[sub.status]}</span>
              </p>
              {sub.price_details && (
                <p className="vrs-muted">
                  {formatPrice(sub.price_details, sub.currency, locale)}
                  {sub.quantity > 1 ? ` × ${sub.quantity}` : ""}
                </p>
              )}
              {nextDate(sub, locale) && <p className="vrs-muted">{nextDate(sub, locale)}</p>}
            </div>
            {sub.cancel_at_period_end ? (
              <button
                type="button"
                className="vrs-button"
                disabled={busy === sub.id}
                onClick={() => props.onResume(sub)}
              >
                Keep plan
              </button>
            ) : (
              <button
                type="button"
                className="vrs-button vrs-button-quiet"
                disabled={busy === sub.id}
                onClick={() => props.onCancel(sub)}
              >
                Cancel plan
              </button>
            )}
          </div>
        ))}
      </section>
      {overview.invoices.length > 0 && (
        <section className="vrs-portal-section">
          <h3 className="vrs-portal-heading">Invoices</h3>
          <ul className="vrs-invoices">
            {overview.invoices.map((invoice) => (
              <li key={invoice.id} className="vrs-invoice">
                <span>{day(invoice.created, locale)}</span>
                <span>{formatAmount(invoice.total, invoice.currency, locale)}</span>
                <span className={`vrs-status vrs-status-${invoice.status}`}>{invoice.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
