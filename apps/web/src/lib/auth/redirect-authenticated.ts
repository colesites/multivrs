import "server-only";

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

/**
 * Keeps authenticated users out of sign-in and recovery screens while still
 * allowing an unverified account to complete email verification.
 */
export async function redirectAuthenticatedUser({
  allowUnverified = false,
}: {
  allowUnverified?: boolean;
} = {}) {
  const session = await getServerSession();
  if (!session) return;

  if (!session.user.emailVerified) {
    if (allowUnverified) return;
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  redirect(session.user.username ? `/${session.user.username}` : "/home");
}
