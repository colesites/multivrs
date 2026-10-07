import { parseArgs } from "node:util";
import { z } from "zod";
import { finish, print, scriptContext } from "./script-env";

/**
 * Puts a merchant's account on hold (live payments stop) or releases it,
 * until there's an admin screen. Identity checks are recorded separately.
 *
 *   bun run merchant:hold --merchant mer_… --reason "Chargebacks under review"
 *   bun run merchant:hold --merchant mer_… --release
 *   bun run merchant:hold --merchant mer_… --approve-identity   (live IDs queued for manual checks)
 */
const { values } = parseArgs({
  options: {
    merchant: { type: "string" },
    reason: { type: "string" },
    release: { type: "boolean", default: false },
    "approve-identity": { type: "boolean", default: false },
  },
});
const merchantId = z
  .string()
  .regex(/^mer_[0-9A-Za-z]{24}$/, "Expected --merchant mer_…")
  .parse(values.merchant);
const actions = [Boolean(values.reason), values.release, values["approve-identity"]].filter(
  Boolean,
).length;
if (actions !== 1)
  throw new Error("Pass exactly one of --reason <text>, --release or --approve-identity.");

const { db } = scriptContext(process.env);
await finish(db, async () => {
  const data = values["approve-identity"]
    ? { identityStatus: "verified" as const, identityReason: null, identityCheckedAt: new Date() }
    : values.release
      ? { status: "verified" as const, rejectionReason: null, reviewedAt: new Date() }
      : {
          status: "rejected" as const,
          rejectionReason: values.reason ?? null,
          reviewedAt: new Date(),
        };
  await db.merchantOnboarding.upsert({
    where: { merchantId },
    create: { merchantId, ...data },
    update: data,
  });
  print({ Merchant: merchantId, Updated: Object.keys(data).join(", ") });
});
