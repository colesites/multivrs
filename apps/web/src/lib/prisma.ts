/**
 * Prisma Client Singleton
 *
 * Configured with @prisma/adapter-pg (pg Pool) for universal PostgreSQL support
 * (Supabase, Neon, AWS RDS, local PostgreSQL).
 */

import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

/**
 * Global type augmentation for development singleton storage
 */
declare global {
  // eslint-disable-next-line no-var
  var multivrsPrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var multivrsPrismaUrl: string | undefined;
}

function getDatabaseUrl(): string {
  // The Supabase transaction pooler can return EAUTHITIMEOUT while it is
  // authenticating a connection. That was breaking every dashboard request at
  // the session lookup. Prefer the configured direct connection for the app;
  // retain DATABASE_URL as a fallback for environments that only provide it.
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DIRECT_URL or DATABASE_URL environment variable is required",
    );
  }
  if (!URL.canParse(databaseUrl)) {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }

  const url = new URL(databaseUrl);
  if (!url.searchParams.has("connect_timeout")) {
    url.searchParams.set("connect_timeout", "15");
  }
  return url.toString();
}

function createPrismaClient(databaseUrl: string): PrismaClient {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

/**
 * Prisma Client instance with strict type safety
 *
 * Singleton pattern:
 * - Production: Creates new instance once
 * - Development: Reuses instance from globalThis to prevent hot-reload issues
 */
const databaseUrl = getDatabaseUrl();
const reusesCurrentConnection = Boolean(
  globalThis.multivrsPrisma && globalThis.multivrsPrismaUrl === databaseUrl,
);

if (globalThis.multivrsPrisma && !reusesCurrentConnection) {
  // HMR preserves global state. Release the old pool when an environment
  // change switches between the Supabase pooled and direct connection URLs.
  void globalThis.multivrsPrisma.$disconnect();
}

let prismaClient: PrismaClient;
if (reusesCurrentConnection && globalThis.multivrsPrisma) {
  prismaClient = globalThis.multivrsPrisma;
} else {
  prismaClient = createPrismaClient(databaseUrl);
}

export const prisma = prismaClient;

/**
 * Store instance on globalThis in development to persist across hot-reloads
 */
if (process.env.NODE_ENV !== "production") {
  globalThis.multivrsPrisma = prisma;
  globalThis.multivrsPrismaUrl = databaseUrl;
}

/**
 * Export Prisma Client type for type-safe usage
 */
export type PrismaClientType = typeof prisma;
