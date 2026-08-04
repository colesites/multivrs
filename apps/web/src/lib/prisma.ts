/**
 * Prisma Client Singleton
 *
 * Requirements: 11.2, 18.8
 *
 * Prevents multiple Prisma Client instances in development due to Next.js hot-reload.
 * In production, creates a single instance. In development, stores the instance on
 * globalThis to persist across hot-reloads.
 *
 * Uses Prisma 7.x with Neon's serverless driver adapter.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

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

/**
 * Create Prisma adapter for Neon.
 *
 * Neon recommends `@prisma/adapter-neon` for Prisma applications. It uses
 * Neon's serverless driver instead of a long-lived TCP `pg.Pool`, which avoids
 * stale local dev sockets and handles serverless-style connection churn better.
 */
const adapter = new PrismaNeon({
  connectionString: getDatabaseUrl(),
});

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
