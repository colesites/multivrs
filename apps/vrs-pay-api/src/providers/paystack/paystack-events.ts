import { createHmac, timingSafeEqual } from "node:crypto";
import {
  CurrencyCodeSchema,
  invalidRequest,
  money,
  type ProviderPayoutStatus,
  type ProviderRefundStatus,
  type ProviderWebhookEvent,
  type SavedMethod,
} from "@vrs-pay/core";

/** Our session id, sent in Paystack metadata (it's also the transaction reference). */
export const SESSION_METADATA_KEY = "vrs_session_id";

/**
 * Paystack's refund events name the payment and the amount, never a refund
 * id, so refunds are matched on both.
 */
export function refundReference(paymentReference: string, amount: number): string {
  return `${paymentReference}:${amount}`;
}

interface Authorization {
  authorization_code?: string;
  reusable?: boolean;
  brand?: string | null;
  card_type?: string | null;
  last4?: string | null;
  exp_month?: string | number | null;
  exp_year?: string | number | null;
  country_code?: string | null;
}

interface PaystackData {
  id?: number;
  status?: string;
  reference?: string;
  amount?: number | string;
  currency?: string;
  fees?: number | null;
  paid_at?: string | null;
  /** An object when sent; Paystack's own examples show 0 or a string otherwise. */
  metadata?: unknown;
  customer?: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    customer_code?: string | null;
  };
  authorization?: Authorization;
  transaction_reference?: string;
  /** Transfers: Paystack's id for the transfer, and the reason given. */
  transfer_code?: string;
  reason?: string | null;
}

/** `x-paystack-signature`: HMAC-SHA512 of the raw body with the secret key, in hex. */
export function verifyPaystackSignature(rawBody: string, header: string | null, secretKey: string) {
  if (!header) return false;
  const expected = createHmac("sha512", secretKey).update(rawBody).digest();
  const given = Buffer.from(header, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function savedMethodFrom(authorization: Authorization | undefined): SavedMethod | null {
  if (!authorization?.reusable || !authorization.authorization_code) return null;
  const month = Number(authorization.exp_month);
  const year = Number(authorization.exp_year);
  return {
    reference: authorization.authorization_code,
    brand: authorization.brand ?? authorization.card_type ?? null,
    last4: authorization.last4 ?? null,
    expMonth: Number.isFinite(month) && month > 0 ? month : null,
    expYear: Number.isFinite(year) && year > 0 ? year : null,
  };
}

function sessionIdOf(data: PaystackData): string | null {
  const metadata = data.metadata;
  if (typeof metadata === "object" && metadata !== null && SESSION_METADATA_KEY in metadata) {
    return String((metadata as Record<string, unknown>)[SESSION_METADATA_KEY]);
  }
  return data.reference ?? null;
}

const REFUND_STATUSES: Record<string, ProviderRefundStatus> = {
  "refund.processed": "succeeded",
  "refund.failed": "failed",
  "refund.pending": "pending",
  "refund.processing": "pending",
};

const TRANSFER_STATUSES: Record<string, ProviderPayoutStatus> = {
  "transfer.success": "paid",
  "transfer.failed": "failed",
  "transfer.reversed": "failed",
};

/** Verifies and maps a Paystack webhook. Paystack sends no event id, so one is derived. */
export function parsePaystackWebhook(
  rawBody: string,
  headers: Headers,
  secretKey: string,
): ProviderWebhookEvent {
  if (!verifyPaystackSignature(rawBody, headers.get("x-paystack-signature"), secretKey)) {
    throw invalidRequest("signature_invalid", "The Paystack signature didn't verify.");
  }
  const { event, data } = JSON.parse(rawBody) as { event?: string; data?: PaystackData };
  const type = event ?? "unknown";
  const base = {
    provider: "paystack" as const,
    account: null,
    occurredAt: Math.floor(Date.now() / 1000),
  };
  const transferStatus = TRANSFER_STATUSES[type];
  if (transferStatus && data?.reference) {
    return {
      ...base,
      id: `${type}:${data.transfer_code ?? data.reference}`,
      type: "payout.updated",
      data: {
        payoutReference: data.reference,
        status: transferStatus,
        failureMessage:
          transferStatus === "failed"
            ? `Paystack says the transfer ${type === "transfer.reversed" ? "was reversed" : "failed"}${data.reason ? `: ${data.reason}` : "."}`
            : null,
      },
    };
  }
  const currency = CurrencyCodeSchema.safeParse(String(data?.currency ?? "").toUpperCase());
  const amount = Number(data?.amount);
  const ignored = (id: string): ProviderWebhookEvent => ({
    ...base,
    id,
    type: "ignored",
    data: { providerType: type },
  });
  if (!data || !currency.success || !Number.isSafeInteger(amount)) {
    return ignored(`${type}:${data?.id ?? data?.reference ?? "?"}`);
  }

  if (type === "charge.success" && data.status === "success" && data.reference) {
    const name = [data.customer?.first_name, data.customer?.last_name].filter(Boolean).join(" ");
    return {
      ...base,
      id: `charge.success:${data.id ?? data.reference}`,
      type: "checkout.completed",
      data: {
        sessionReference: data.reference,
        sessionId: sessionIdOf(data),
        paymentReference: data.reference,
        amount: money(amount, currency.data),
        platformFee: money(0, currency.data),
        providerFee: money(Number(data.fees ?? 0) || 0, currency.data),
        customerEmail: data.customer?.email ?? null,
        customerName: name || null,
        customerCountry: data.authorization?.country_code ?? null,
        savedMethod: savedMethodFrom(data.authorization),
        providerCustomer: data.customer?.customer_code ?? null,
      },
    };
  }

  const refundStatus = REFUND_STATUSES[type];
  if (refundStatus && data.transaction_reference) {
    const reference = refundReference(data.transaction_reference, amount);
    return {
      ...base,
      id: `${type}:${reference}`,
      type: "refund.updated",
      data: {
        refundReference: reference,
        refundId: null,
        paymentReference: data.transaction_reference,
        status: refundStatus,
        amount: money(amount, currency.data),
      },
    };
  }

  return ignored(`${type}:${data.id ?? data.reference ?? data.transaction_reference ?? "?"}`);
}
