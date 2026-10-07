import { randomBase62 } from "./crypto";

export const ID_KINDS = [
  "merchant",
  "customer",
  "checkoutSession",
  "payment",
  "refund",
  "event",
  "request",
  "ledgerTransaction",
  "webhookEndpoint",
  "apiKey",
  "feature",
  "product",
  "plan",
  "price",
  "subscription",
  "invoice",
  "paymentMethod",
  "customerSession",
  "paymentLink",
] as const;

export type IdKind = (typeof ID_KINDS)[number];

/** Stripe-style prefixed ids: the prefix tells you what an id is at a glance. */
export const ID_PREFIXES: Record<IdKind, string> = {
  merchant: "mer",
  customer: "cus",
  checkoutSession: "cs",
  payment: "pay",
  refund: "re",
  event: "evt",
  request: "req",
  ledgerTransaction: "ltx",
  webhookEndpoint: "we",
  apiKey: "key",
  feature: "feat",
  product: "prod",
  plan: "plan",
  price: "price",
  subscription: "sub",
  invoice: "in",
  paymentMethod: "pm",
  customerSession: "sess",
  paymentLink: "plink",
};

const ID_BODY_LENGTH = 24;
const ID_PATTERN = /^([a-z]+)_([0-9A-Za-z]{24})$/;

export function newId(kind: IdKind): string {
  return `${ID_PREFIXES[kind]}_${randomBase62(ID_BODY_LENGTH)}`;
}

/** Returns the kind of a well-formed id, or null if it isn't one of ours. */
export function idKind(id: string): IdKind | null {
  const prefix = ID_PATTERN.exec(id)?.[1];
  if (!prefix) return null;
  return ID_KINDS.find((kind) => ID_PREFIXES[kind] === prefix) ?? null;
}
