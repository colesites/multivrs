import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "next-sanity";
import { recommendedPricingComparison } from "../src/sanity/seed/recommended-pricing-comparison";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(appRoot, ".env.local"), quiet: true });
config({ path: resolve(appRoot, ".env"), quiet: true });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2026-07-24";
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
if (!token) throw new Error("SANITY_API_WRITE_TOKEN is required");

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  token,
  useCdn: false,
});

if (dryRun) {
  process.stdout.write(
    `Pricing seed configuration is valid for Sanity project ${projectId}, dataset ${dataset}. No document was written.\n`,
  );
  process.exit(0);
}

if (force) {
  await client.createOrReplace(recommendedPricingComparison);
} else {
  await client.createIfNotExists(recommendedPricingComparison);
}

process.stdout.write(
  `${force ? "Replaced" : "Seeded if missing"} pricingComparison in Sanity project ${projectId}, dataset ${dataset}.\n`,
);
