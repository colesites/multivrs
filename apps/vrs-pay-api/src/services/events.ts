import { type ApiKeyMode, newId } from "@vrs-pay/core";
import type { EventType, StoredEvent, VrsEvent } from "./event.types";

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** A new merchant-facing event wrapping `object` (a payment, refund, …). */
export function buildEvent(
  merchantId: string,
  mode: ApiKeyMode,
  type: EventType,
  object: VrsEvent["data"]["object"],
): StoredEvent {
  return {
    merchantId,
    mode,
    event: {
      id: newId("event"),
      object: "event",
      type,
      livemode: mode === "live",
      created: nowSeconds(),
      data: { object },
    },
  };
}
