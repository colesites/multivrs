import { createApp } from "./app";
import { DEFAULT_PORT } from "./constants";
import { createDependencies } from "./deps/dependencies";
import { startBillingWorker } from "./services/billing-cycle";
import { startDeliveryWorker } from "./services/webhook-delivery.service";

// `bun --hot` re-runs this file on every save without restarting the process.
// Stop the previous run's workers and close its database pool first, or each
// save leaves another pool open until Supabase refuses new connections.
const hot = globalThis as typeof globalThis & { stopVrsPayApi?: () => Promise<void> };
await hot.stopVrsPayApi?.();

const { deps, db } = await createDependencies(process.env);
const app = createApp(deps);

function report(event: string) {
  return (error: unknown) => {
    // biome-ignore lint/suspicious/noConsole: background workers have no other place to report failures.
    console.error(
      JSON.stringify({ event, error: error instanceof Error ? error.message : String(error) }),
    );
  };
}

const stopDeliveries = startDeliveryWorker(deps.deliveries, report("webhook_delivery_failed"));
const stopBilling = startBillingWorker(deps, report("billing_cycle_failed"));
hot.stopVrsPayApi = async () => {
  stopDeliveries();
  stopBilling();
  await db?.$disconnect();
};

export default {
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  fetch: app.fetch,
};
