import { CurrencyCodeSchema, formatMoney, money } from "@vrs-pay/core";
import type { PaymentLink } from "../services/payment-link.types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function priceLabel(link: Omit<PaymentLink, "url">): string {
  const amount = formatMoney(money(link.amount, CurrencyCodeSchema.parse(link.currency)));
  if (link.interval === "one_time") return amount;
  const every =
    link.interval_count === 1 ? link.interval : `${link.interval_count} ${link.interval}s`;
  return `${amount} / ${every}`;
}

/**
 * What `GET /l/:id` returns: a page that posts itself to open the checkout.
 * Link previews (WhatsApp, Slack, email scanners) only fetch it, so they
 * get a title and price but never start a checkout or make a customer.
 */
export function paymentLinkPage(link: Omit<PaymentLink, "url">): string {
  const title = escapeHtml(link.description);
  const price = escapeHtml(priceLabel(link));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · ${price}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${price}. Pay securely with VRS Pay.">
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#fafafa;color:#111}
form{text-align:center;padding:24px}
p{margin:0 0 16px;line-height:1.5}
button{font:inherit;padding:12px 20px;border:0;border-radius:8px;background:#111;color:#fff;cursor:pointer}
</style>
</head>
<body>
<form method="post">
<p>${title}<br><strong>${price}</strong></p>
<button type="submit">Continue to checkout</button>
</form>
<script>document.forms[0].submit()</script>
</body>
</html>`;
}
