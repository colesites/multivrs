/**
 * Better Auth Client Instance
 *
 * Requirements: 14.1, 18.2
 *
 * Client-side Better Auth instance for React components.
 *
 * Use this client in React components via hooks:
 * - useSession() - Get current session
 * - signUp.email() - Register with email/password
 * - signIn.email() - Sign in with email/password
 * - signIn.social() - OAuth sign-in
 * - signOut() - End session
 */

import { emailOTPClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance
 *
 * Provides client-side authentication methods and hooks.
 * Automatically syncs with server-side auth state.
 */
export const authClient = createAuthClient({
  // Base URL for auth API (defaults to /api/auth)
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",

  // Must mirror the server-side `username` + `emailOTP` plugins
  plugins: [usernameClient(), emailOTPClient()],
});

/**
 * Use the methods directly off `authClient` — e.g. `authClient.signIn.email()`,
 * `authClient.useSession()`.
 *
 * We intentionally don't re-export the individual methods (e.g.
 * `export const { signUp } = authClient`): with `declaration: true` the
 * username plugin's inferred method types can't be named without referencing a
 * non-portable better-auth internal path (TS2742). Accessing them through
 * `authClient` avoids that entirely.
 */
