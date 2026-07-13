/**
 * Prisma Adapter Configuration for Better Auth
 *
 * Requirements: 11.2, 18.2
 *
 * Configures the Prisma adapter to connect Better Auth with the Neon Postgres
 * database. Maps Better Auth's data model to our Prisma schema with proper
 * table names and relationships.
 *
 * The adapter handles:
 * - User authentication data (users table)
 * - Session management (sessions table)
 * - OAuth accounts (accounts table)
 * - Email verification tokens (verifications table)
 */

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

/**
 * Prisma adapter instance for Better Auth
 *
 * Connects Better Auth to Neon Postgres via Prisma ORM with:
 * - PostgreSQL provider configuration
 * - Automatic table name mapping to match our schema
 * - Type-safe database operations
 * - Connection pooling via Prisma Client
 *
 * The adapter automatically maps Better Auth's internal model names
 * to our Prisma schema table names:
 * - user -> users
 * - session -> sessions
 * - account -> accounts
 * - verification -> verifications
 */
export const adapter = prismaAdapter(prisma, {
  provider: "postgresql",
});
