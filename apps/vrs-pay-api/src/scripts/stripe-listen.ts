import { DEFAULT_PORT } from "../constants";

/**
 * Forwards Stripe test webhooks (platform and connected accounts) to the
 * local API. Authenticates with STRIPE_SECRET_KEY from this app's
 * .env.local, so no `stripe login` session is needed.
 */
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey?.startsWith("sk_test_")) {
  throw new Error("Set a test STRIPE_SECRET_KEY (sk_test_…) in apps/vrs-pay-api/.env.local.");
}
const target = `localhost:${process.env.PORT ?? DEFAULT_PORT}/webhooks/stripe`;
const listener = Bun.spawn(
  ["stripe", "listen", "--forward-to", target, "--forward-connect-to", target],
  { env: { ...process.env, STRIPE_API_KEY: apiKey }, stdio: ["inherit", "inherit", "inherit"] },
);
process.exit(await listener.exited);
