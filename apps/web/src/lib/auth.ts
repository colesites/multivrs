/**
 * Better Auth Server Instance
 *
 * Requirements: 18.1, 18.2
 *
 * Main authentication server instance for the Multivrs platform.
 * Configured with Prisma adapter, OAuth providers, session management,
 * security features, and Convex synchronization.
 *
 * This instance is used server-side in API routes and middleware.
 */

import { betterAuth } from "better-auth";
import { authConfig } from "./auth/config";

/**
 * Better Auth server instance
 *
 * Provides:
 * - Email/password authentication
 * - OAuth (Google, GitHub)
 * - Session management (7-day expiration)
 * - CSRF protection
 * - Rate limiting
 * - Convex synchronization via database hooks
 * - Type-safe session and user objects
 */
export const auth = betterAuth(authConfig);

/**
 * Type inference for Session
 * Requirements: 18.1, 18.2
 */
export type Session = typeof auth.$Infer.Session;

/**
 * Type inference for User
 * Requirements: 18.1, 18.2
 */
export type User = typeof auth.$Infer.Session.user;
