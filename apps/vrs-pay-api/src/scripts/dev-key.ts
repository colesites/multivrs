import { generateApiKey } from "@vrs-pay/core";

/** Prints a fresh test secret key for `.env.local` (local dev only). */
const key = await generateApiKey("secret", "test");
process.stdout.write(`VRS_DEV_SECRET_KEY=${key.plaintext}\n`);
