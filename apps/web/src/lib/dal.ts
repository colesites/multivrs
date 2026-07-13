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

  try {
    // Verify session with Better Auth
    const session = await auth.api.getSession({
      headers: {
        cookie: `multivrs.session_token=${sessionCookie.value}`,
      },
    });

    if (!session?.user) {
      redirect("/login");
    }

    return {
      isAuth: true,
      userId: session.user.id,
      user: session.user,
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    redirect("/login");
  }
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
  try {
    const session = await verifySession();

    if (!session?.user) {
      return null;
    }

    // Return only necessary user fields for security
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      emailVerified: session.user.emailVerified,
    };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
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
