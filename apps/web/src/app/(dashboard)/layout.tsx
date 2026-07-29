import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardAuthFallback } from "@/features/dashboard/components/DashboardAuthFallback";
import { getServerSession } from "@/lib/auth/session";
import { geistMono, hankenGrotesk } from "@/lib/dashboard-fonts";

/**
 * Layout for the authenticated dashboard area (everything under /[username]).
 *
 * Renders the shared dashboard chrome (top nav, team switcher, etc.) around
 * every dashboard page. Also acts as the authoritative auth gate: the Proxy
 * does a fast optimistic cookie check, but this layout verifies the real
 * session on the server.
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <DashboardAuthFallback
          className={`${hankenGrotesk.variable} ${geistMono.variable}`}
        />
      }
    >
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

async function AuthenticatedDashboard({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Email verification gate: unverified users can hold a session (auto sign-in
  // on sign-up) but cannot reach the dashboard until they enter the OTP.
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return (
    <div
      className={`${hankenGrotesk.variable} ${geistMono.variable} dashboard-shell`}
    >
      {/* TODO: dashboard nav / team switcher goes here */}
      {children}
    </div>
  );
}
