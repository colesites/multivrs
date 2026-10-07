import type { AppDeps } from "../app.types";
import { renewSubscription } from "./billing-engine.service";
import { type CollectionOutcome, collectInvoice } from "./invoice-collection.service";

const BATCH_SIZE = 50;

/**
 * One pass of the engine: renew what's due, then charge what's due. One
 * subscription or invoice failing is reported to `onError` and skipped, so
 * it can't hold up everyone else's billing.
 */
export async function runBillingCycle(
  deps: AppDeps,
  now = new Date(),
  onError: (error: unknown) => void = () => {},
) {
  const at = Math.floor(now.getTime() / 1000);
  let renewed = 0;
  for (const sub of await deps.billing.dueSubscriptions(now, BATCH_SIZE)) {
    try {
      if (await renewSubscription(deps, sub, at)) renewed += 1;
    } catch (error) {
      onError(error);
    }
  }
  const outcomes: Array<CollectionOutcome | "error"> = [];
  for (const invoice of await deps.billing.dueInvoices(now, BATCH_SIZE)) {
    try {
      outcomes.push(await collectInvoice(deps, invoice, at));
    } catch (error) {
      onError(error);
      outcomes.push("error");
    }
  }
  return { renewed, collected: outcomes };
}

/** Runs the engine every minute, one pass at a time. Returns a stop function. */
export function startBillingWorker(
  deps: AppDeps,
  onError: (error: unknown) => void,
  intervalMs = 60_000,
): () => void {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try {
      await runBillingCycle(deps, new Date(), onError);
    } catch (error) {
      onError(error);
    } finally {
      running = false;
    }
  }, intervalMs);
  return () => clearInterval(timer);
}
