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
  // In production (serverless), prefer DATABASE_URL (transaction pooler, port 6543)
  // to avoid exhausting the 15-connection session limit across concurrent lambdas.
  // In development (localhost), prefer DIRECT_URL (port 5432) to avoid transaction pooler EAUTHITIMEOUT.
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = isProduction
    ? (process.env.DATABASE_URL ?? process.env.DIRECT_URL)
    : (process.env.DIRECT_URL ?? process.env.DATABASE_URL);

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL or DIRECT_URL environment variable is required",
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
    // In serverless environments, cap connections per lambda instance to avoid pool exhaustion
    max: process.env.NODE_ENV === "production" ? 2 : 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 15000,
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
