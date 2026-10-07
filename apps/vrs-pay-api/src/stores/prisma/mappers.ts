import { PAYMENT_METHODS, REFUND_REASONS } from "@vrs-pay/core";
import { z } from "zod";
import { toCurrency, toMetadata, toMinor, toUnix } from "../../db/convert";
import type {
  WebhookEndpoint as EndpointRow,
  Payment as PaymentRow,
  Refund as RefundRow,
  CheckoutSession as SessionRow,
} from "../../generated/prisma/client";
import type { StoredCheckoutSession } from "../../services/checkout-session.types";
import type { StoredPayment } from "../../services/payment.types";
import type { StoredRefund } from "../../services/refund.types";
import type { WebhookEndpoint } from "../../services/webhook-endpoint.types";

const PaymentMethodSchema = z.enum(PAYMENT_METHODS);
const RefundReasonSchema = z.enum(REFUND_REASONS).nullable();

export function sessionFromRow(row: SessionRow): StoredCheckoutSession {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    session: {
      id: row.id,
      object: "checkout.session",
      livemode: row.mode === "live",
      status: row.status,
      mode: row.checkoutMode,
      customer: row.customerId,
      subscription: row.subscriptionId,
      payment_link: row.paymentLinkId,
      amount: toMinor(row.amount),
      currency: toCurrency(row.currency).toLowerCase(),
      payment_method: PaymentMethodSchema.parse(row.paymentMethod),
      description: row.description,
      provider: row.provider,
      provider_reference: row.providerReference,
      url: row.url,
      platform_fee: toMinor(row.platformFee),
      success_url: row.successUrl,
      cancel_url: row.cancelUrl,
      customer_email: row.customerEmail,
      metadata: toMetadata(row.metadata),
      created: toUnix(row.createdAt),
    },
  };
}

export function paymentFromRow(row: PaymentRow): StoredPayment {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    providerAccountId: row.providerAccountId,
    payment: {
      id: row.id,
      object: "payment",
      livemode: row.mode === "live",
      status: row.status,
      amount: toMinor(row.amount),
      amount_refunded: toMinor(row.amountRefunded),
      currency: toCurrency(row.currency).toLowerCase(),
      platform_fee: toMinor(row.platformFee),
      provider_fee: toMinor(row.providerFee),
      provider: row.provider,
      provider_reference: row.providerReference,
      checkout_session: row.checkoutSessionId,
      customer_email: row.customerEmail,
      metadata: toMetadata(row.metadata),
      created: toUnix(row.createdAt),
    },
  };
}

export function refundFromRow(row: RefundRow): StoredRefund {
  return {
    merchantId: row.merchantId,
    mode: row.mode,
    provider: row.provider,
    refund: {
      id: row.id,
      object: "refund",
      livemode: row.mode === "live",
      status: row.status,
      amount: toMinor(row.amount),
      currency: toCurrency(row.currency).toLowerCase(),
      payment: row.paymentId,
      provider_reference: row.providerReference,
      reason: RefundReasonSchema.parse(row.reason),
      metadata: toMetadata(row.metadata),
      created: toUnix(row.createdAt),
    },
  };
}

export function endpointFromRow(row: EndpointRow): WebhookEndpoint {
  return {
    id: row.id,
    object: "webhook_endpoint",
    livemode: row.mode === "live",
    url: row.url,
    enabled_events: row.enabledEvents,
    status: row.disabledAt ? "disabled" : "enabled",
    created: toUnix(row.createdAt),
  };
}
