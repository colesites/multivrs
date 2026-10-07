import { parseArgs } from "node:util";
import { DEFAULT_FEE_BPS, generateApiKey, hashApiKey, newId, parseApiKey } from "@vrs-pay/core";
import { z } from "zod";
import { finish, print, scriptContext } from "./script-env";

/**
 * Creates a test-mode merchant with a secret key, without the dashboard.
 *
 *   bun run merchant:create --name "Acme" --email dev@acme.test [--fee-bps 500] [--use-dev-key]
 *
 * --use-dev-key registers VRS_DEV_SECRET_KEY instead of printing a new key.
 */
const ArgsSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  "fee-bps": z.coerce.number().int().min(0).max(10_000),
  "use-dev-key": z.boolean(),
});

const { values } = parseArgs({
  options: {
    name: { type: "string" },
    email: { type: "string" },
    "fee-bps": { type: "string", default: String(DEFAULT_FEE_BPS) },
    "use-dev-key": { type: "boolean", default: false },
  },
});
const args = ArgsSchema.parse(values);

async function secretKey() {
  if (!args["use-dev-key"]) return generateApiKey("secret", "test");
  const plaintext = process.env.VRS_DEV_SECRET_KEY ?? "";
  const parsed = parseApiKey(plaintext);
  if (parsed?.kind !== "secret" || parsed.mode !== "test") {
    throw new Error("VRS_DEV_SECRET_KEY must be a test secret key (sk_test_…).");
  }
  return {
    plaintext: null,
    displayPrefix: `${plaintext.slice(0, 12)}…`,
    hash: await hashApiKey(plaintext),
  };
}

const { db } = scriptContext(process.env);
await finish(db, async () => {
  const merchantId = newId("merchant");
  const key = await secretKey();
  await db.merchant.create({
    data: {
      id: merchantId,
      name: args.name,
      email: args.email,
      platformFeeBps: args["fee-bps"],
      apiKeys: {
        create: {
          id: newId("apiKey"),
          mode: "test",
          kind: "secret",
          hash: key.hash,
          displayPrefix: key.displayPrefix,
        },
      },
    },
  });
  print({
    Merchant: merchantId,
    "Secret key": key.plaintext ?? "VRS_DEV_SECRET_KEY (from .env.local)",
  });
});
