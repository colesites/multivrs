import type { AppDeps } from "../app.types";
import { createBetterAuth } from "../auth/better-auth";
import { createDb, type Db, databaseUrl } from "../db/client";
import { createEmailSender } from "../email/senders";
import { createSealer } from "../lib/sealer";
import { createPrismaStores } from "../stores/prisma";
import { createMemoryDependencies } from "./memory-dependencies";
import { stripeModes } from "./stripe-modes";

type Env = Record<string, string | undefined>;

/**
 * Postgres when DATABASE_URL/DIRECT_URL is set, otherwise in-memory stores.
 * Stripe is real for each mode that has a key (see stripeModes). The
 * dashboard is on when Better Auth is configured (database only).
 */
export async function createDependencies(env: Env): Promise<{ deps: AppDeps; db: Db | null }> {
  const modes = stripeModes(env);
  const urls = {
    api: (env.BETTER_AUTH_URL ?? `http://localhost:${env.PORT ?? 4300}`).replace(/\/+$/, ""),
    site: (env.VRS_DASHBOARD_URL ?? "https://vrs-pay.multivrs.space").replace(/\/+$/, ""),
  };
  const url = databaseUrl(env);
  if (!url) {
    return { deps: { ...(await createMemoryDependencies(env)), modes, urls }, db: null };
  }
  const db = createDb(url);
  const stores = createPrismaStores(db);
  const auth = createBetterAuth(db, env, stores.merchants, createEmailSender(env)) ?? undefined;
  const sealer = env.VRS_DATA_KEY ? await createSealer(env.VRS_DATA_KEY) : undefined;
  return { deps: { ...stores, modes, auth, urls, sealer }, db };
}
