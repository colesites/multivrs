import type { BillingConfig } from "./params";

/** Types your `vrs-pay.config.ts` and returns it unchanged; `vrs-pay push` sends it. */
export function defineConfig<T extends BillingConfig>(config: T): T {
  return config;
}
