import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

export type Db = PrismaClient;

/**
 * Production uses DATABASE_URL (Supabase transaction pooler, 6543); local
 * dev prefers DIRECT_URL (session pooler, 5432), the same as apps/web.
 */
export function databaseUrl(env: Record<string, string | undefined>): string | null {
  const url =
    env.NODE_ENV === "production"
      ? (env.DATABASE_URL ?? env.DIRECT_URL)
      : (env.DIRECT_URL ?? env.DATABASE_URL);
  if (!url) return null;
  if (!URL.canParse(url)) throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  const parsed = new URL(url);
  if (!parsed.searchParams.has("connect_timeout")) parsed.searchParams.set("connect_timeout", "15");
  return parsed.toString();
}

/** Prisma over a pg Pool. The API is a long-running server, so one pool per process; $disconnect closes it. */
export function createDb(url: string): Db {
  const pool = new Pool({
    connectionString: url,
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });
  return new PrismaClient({
    adapter: new PrismaPg(pool, { disposeExternalPool: true }),
    log: ["error"],
  });
}
