import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

/**
 * Layout for the authenticated dashboard area (everything under /[username]).
 *
 * Renders the shared dashboard chrome (top nav, team switcher, etc.) around
 * every dashboard page. Also acts as the authoritative auth gate: the Proxy
 * does a fast optimistic cookie check, but this layout verifies the real
 * session on the server.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/login");
  }

  // Email verification gate: unverified users can hold a session (auto sign-in
  // on sign-up) but cannot reach the dashboard until they enter the OTP.
  if (!session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return (
    <div className="dashboard-shell">
      {/* TODO: dashboard nav / team switcher goes here */}
      <main>{children}</main>
    </div>
  );
}
