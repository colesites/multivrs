import type { Payment } from "../services/payment.types";

export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function paymentsToCsv(payments: Payment[]): string {
  const headers = [
    "Payment ID",
    "Date (UTC)",
    "Status",
    "Amount",
    "Currency",
    "Net Amount",
    "Provider Fee",
    "Platform Fee",
    "Amount Refunded",
    "Customer Email",
    "Provider",
    "Provider Reference",
    "Checkout Session ID",
    "Mode",
  ];

  const lines = [headers.join(",")];
  for (const p of payments) {
    const net = (p.amount - p.provider_fee - p.platform_fee) / 100;
    const row = [
      escapeCsv(p.id),
      escapeCsv(new Date(p.created * 1000).toISOString()),
      escapeCsv(p.status),
      escapeCsv((p.amount / 100).toFixed(2)),
      escapeCsv(p.currency.toUpperCase()),
      escapeCsv(net.toFixed(2)),
      escapeCsv((p.provider_fee / 100).toFixed(2)),
      escapeCsv((p.platform_fee / 100).toFixed(2)),
      escapeCsv(((p.amount_refunded ?? 0) / 100).toFixed(2)),
      escapeCsv(p.customer_email ?? ""),
      escapeCsv(p.provider ?? "stripe"),
      escapeCsv(p.provider_reference ?? ""),
      escapeCsv(p.checkout_session ?? ""),
      escapeCsv(p.livemode ? "live" : "test"),
    ];
    lines.push(row.join(","));
  }
  return lines.join("\r\n");
}
