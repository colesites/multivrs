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
  /** How POST /transfer answers (default pending, as Paystack does); "network" throws. */
  transfer?: "pending" | "success" | "failed" | "otp" | "network";
  /** What GET /transfer/verify says (default success). */
  verifiedTransfer?: string;
  /** Account numbers the bank knows, with their holder's name. */
  accounts?: Record<string, string>;
}

/** Paystack's Nigerian bank list, two pages of it. */
export const BANK_PAGES = [
  [
    { name: "Guaranty Trust Bank", code: "058", active: true },
    { name: "Access Bank", code: "044", active: true },
  ],
  [
    { name: "Zenith Bank", code: "057", active: true },
    { name: "Closed Bank", code: "999", active: false },
  ],
];

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
    async page<T>(path: string) {
      calls.push({ method: "GET", path });
      const second = path.includes("next=page2");
      return {
        data: (second ? BANK_PAGES[1] : BANK_PAGES[0]) as unknown as T[],
        next: second ? null : "page2",
      };
    },
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
      if (method === "POST" && path === "/transferrecipient") {
        return answer({ recipient_code: `RCP_${String(b?.account_number)}` });
      }
      if (method === "POST" && path === "/transfer") {
        const status = options.transfer ?? "pending";
        if (status === "network") throw fail(path, "socket hang up", true);
        return answer({ status, reference: b?.reference, transfer_code: `TRF_${calls.length}` });
      }
      if (method === "GET" && path.startsWith("/transfer/verify/")) {
        const reference = decodeURIComponent(path.slice("/transfer/verify/".length));
        return answer({ status: options.verifiedTransfer ?? "success", reference });
      }
      if (method === "GET" && path.startsWith("/bank/resolve")) {
        const number = new URL(`https://x${path}`).searchParams.get("account_number") ?? "";
        const name = options.accounts?.[number];
        if (!name) throw fail(path, "Could not resolve account name");
        return answer({ account_number: number, account_name: name });
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

/** A transfer webhook: success, failed or reversed. */
export function transferEvent(type: string, reference: string, amount: number) {
  return {
    event: type,
    data: {
      reference,
      amount,
      currency: "NGN",
      status: type.slice("transfer.".length),
      transfer_code: `TRF_${reference}`,
      reason: type === "transfer.success" ? "VRS Pay payout" : "Account closed",
    },
  };
}
