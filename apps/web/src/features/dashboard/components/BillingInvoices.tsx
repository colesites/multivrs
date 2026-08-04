import type { BillingInvoiceSummary } from "@/features/dashboard/types/billing.types";

const AMOUNT_FORMAT = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function BillingInvoices({
  invoices,
}: {
  invoices: BillingInvoiceSummary[];
}) {
  if (!invoices.length) return null;
  return (
    <div className="py-5">
      <p className="text-sm font-medium">Recent invoices</p>
      <div className="mt-3">
        {invoices.map((invoice) => (
          <div
            className="flex items-center justify-between border-t border-[var(--hairline)] py-3 text-sm"
            key={invoice.id}
          >
            <div>
              <p className="font-geist-mono text-xs">{invoice.id}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">
                {invoice.status}
              </p>
            </div>
            <div className="text-right">
              <p>
                {invoice.currency.toUpperCase()}{" "}
                {AMOUNT_FORMAT.format(invoice.amountDueCents / 100)}
              </p>
              {invoice.hostedInvoiceUrl ? (
                <a
                  className="mt-1 text-xs text-blue-400 hover:underline"
                  href={invoice.hostedInvoiceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open invoice
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
