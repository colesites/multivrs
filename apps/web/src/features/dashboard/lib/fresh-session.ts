import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

/**
 * Better Auth asks for a sign-in from the last day before sensitive changes
 * (adding a passkey, disconnecting a login). True when that's why it failed.
 */
export function needsRecentSignIn(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "SESSION_NOT_FRESH"
  );
}

/** Explains the check and offers to sign in again, then come back here. */
export function askToSignInAgain(returnTo: string): void {
  toast.error("For your security, sign in again to make this change.", {
    action: {
      label: "Sign in again",
      onClick: () => {
        void authClient.signOut().then(() => {
          window.location.assign(`/login?from=${encodeURIComponent(returnTo)}`);
        });
      },
    },
  });
}
