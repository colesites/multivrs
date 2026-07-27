/**
 * Data Access Layer (DAL)
 *
 * Server-only module for secure data access with authentication verification.
 * Implements Next.js 16 best practices for authentication.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { logError } from "@/lib/services/logger.service";

/**
 * Verify the current session
 *
 * Checks if user is authenticated by validating the session cookie.
 * Redirects to /sign-in if not authenticated.
 *
 * @returns Session data with userId
 */
export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("multivrs.session_token");

  if (!sessionCookie?.value) {
    redirect("/sign-in");
  }

  const session = await auth.api
    .getSession({
      headers: {
        cookie: `multivrs.session_token=${sessionCookie.value}`,
      },
    })
    .catch((error: unknown) => {
      logError("auth.session.verification_failed", error);
      return null;
    });

  if (!session?.user) {
    redirect("/login");
  }

  return {
    isAuth: true,
    userId: session.user.id,
    user: session.user,
  };
});

/**
 * Get current authenticated user
 *
 * Returns user data if authenticated, null otherwise.
 * Use this in Server Components to access user data.
 *
 * @returns User object or null
 */
export const getUser = cache(async () => {
  const session = await verifySession();
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    emailVerified: session.user.emailVerified,
  };
});

/**
 * Check if user is authenticated (without redirect)
 *
 * Use this when you need to check auth status without forcing a redirect.
 *
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = cache(async () => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("multivrs.session_token");

    if (!sessionCookie?.value) {
      return false;
    }

    const session = await auth.api.getSession({
      headers: {
        cookie: `multivrs.session_token=${sessionCookie.value}`,
      },
    });

    return !!session?.user;
  } catch (_error) {
    return false;
  }
});
