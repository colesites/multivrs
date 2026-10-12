import { createHmac } from "node:crypto";
import { providerRequestFailed } from "@vrs-pay/core";
import type { PaystackApi } from "../../apps/vrs-pay-api/src/providers/paystack/paystack-api";

export const PAYSTACK_SECRET = "sk_test_vrs_paystack";

export interface FakePaystackOptions {
  /** Paystack's fee on a charge (kobo). */
  fees?: number;
  /** How saved-card charges end (default: succeed). */
  charge?: "success" | "paused" | "failed" | "network" | "duplicate";
  /** The status POST /refund answers with (default pending, as Paystack does). */
  refundStatus?: string;
}

interface Call {
  method: string;
  path: string;
  body?: Record<string, unknown>;
}

/** Paystack's REST API, answering with the fields the adapter reads. */
export function fakePaystackApi(options: FakePaystackOptions = {}) {
  const calls: Call[] = [];
  const customers = new Map<string, string>();
  const fees = () => options.fees ?? 7500;
  const fail = (path: string, message: string, retryable = false) =>
    providerRequestFailed("paystack", path, message, retryable);

  const api: PaystackApi = {
    async request<T>(method: "GET" | "POST", path: string, body?: object): Promise<T> {
      const b = body as Record<string, unknown> | undefined;
      calls.push({ method, path, body: b });
      const answer = (value: unknown) => value as T;
      if (method === "POST" && path === "/transaction/initialize") {
        const code = `ac_${calls.length}`;
        return answer({
          authorization_url: `https://checkout.paystack.com/${code}`,
          access_code: code,
          reference: b?.reference,
        });
      }
      if (method === "POST" && path === "/customer") {
        const code = `CUS_${customers.size + 1}`;
        customers.set(code, String(b?.email));
        return answer({ customer_code: code, email: b?.email });
      }
      if (method === "GET" && path.startsWith("/customer/")) {
        const email = customers.get(decodeURIComponent(path.slice("/customer/".length)));
        if (!email) throw fail(path, "Customer not found");
        return answer({ email });
      }
      if (method === "POST" && path === "/refund") {
        return answer({ status: options.refundStatus ?? "pending" });
      }
      if (method === "POST" && path === "/transaction/charge_authorization") {
        const reference = b?.reference;
        switch (options.charge ?? "success") {
          case "success":
            return answer({ status: "success", reference, fees: fees() });
          case "paused":
            return answer({ status: "success", reference, paused: true });
          case "failed":
            return answer({ status: "failed", reference, gateway_response: "Insufficient Funds" });
          case "network":
            throw fail(path, "socket hang up", true);
          case "duplicate":
            throw fail(path, "Duplicate Transaction Reference");
        }
      }
      if (method === "GET" && path.startsWith("/transaction/verify/")) {
        const reference = decodeURIComponent(path.slice("/transaction/verify/".length));
        return answer({ status: "success", reference, fees: fees() });
      }
      throw new Error(`fake Paystack has no ${method} ${path}`);
    },
  };
  return { api, calls, options };
}

/** A webhook request signed the way Paystack signs it. */
export function signedPaystackRequest(payload: object, secret = PAYSTACK_SECRET) {
  const body = JSON.stringify(payload);
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paystack-signature": createHmac("sha512", secret).update(body).digest("hex"),
    },
    body,
  };
}

/** `charge.success` for a transaction, with a reusable card unless told otherwise. */
export function chargeSuccess(
  reference: string,
  amount: number,
  extra: { fees?: number | null; reusable?: boolean; metadata?: unknown } = {},
) {
  return {
    event: "charge.success",
    data: {
      id: 302961,
      status: "success",
      reference,
      amount,
      currency: "NGN",
      fees: extra.fees === undefined ? 7500 : extra.fees,
      metadata: extra.metadata ?? 0,
      customer: {
        email: "ada@shop.test",
        first_name: "Ada",
        last_name: "Obi",
        customer_code: "CUS_1",
      },
      authorization: {
        authorization_code: "AUTH_8dfhjjdt",
        reusable: extra.reusable ?? true,
        brand: "visa",
        last4: "4081",
        exp_month: "12",
        exp_year: "2030",
        country_code: "NG",
      },
    },
  };
}

/** A refund event: Paystack sends the amount as a string. */
export function refundEvent(type: string, transactionReference: string, amount: number) {
  return {
    event: type,
    data: {
      status: type.slice("refund.".length),
      transaction_reference: transactionReference,
      refund_reference: null,
      amount: String(amount),
      currency: "NGN",
    },
  };
}
