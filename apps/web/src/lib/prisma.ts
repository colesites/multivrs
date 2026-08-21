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
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
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

const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

const adapter = new PrismaPg(pool);

/**
 * Prisma Client instance with strict type safety
 *
 * Singleton pattern:
 * - Production: Creates new instance once
 * - Development: Reuses instance from globalThis to prevent hot-reload issues
 */
export const prisma =
  globalThis.multivrsPrisma ??
  new PrismaClient({
    adapter,
    log: ["error"],
  });

/**
 * Store instance on globalThis in development to persist across hot-reloads
 */
if (process.env.NODE_ENV !== "production") {
  globalThis.multivrsPrisma = prisma;
}

/**
 * Export Prisma Client type for type-safe usage
 */
export type PrismaClientType = typeof prisma;
