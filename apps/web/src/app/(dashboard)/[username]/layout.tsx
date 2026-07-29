import { notFound, redirect } from "next/navigation";
import { AccountChrome } from "@/features/dashboard/components/AccountChrome";
import { getServerSession } from "@/lib/auth/session";

/**
 * Account-scoped chrome served around every page under /[username]. Renders the
 * premium dashboard rail. The parent (dashboard) layout already gates auth and
 * email verification; here we read the session for the user/workspace UI.
 */
export default async function AccountLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}>) {
  const [session, { username }] = await Promise.all([
    getServerSession(),
    params,
  ]);
  if (!session) {
    redirect("/login");
  }

  if (session.user.username !== username) notFound();

  return (
    <div className="dashboard-surface min-h-screen bg-[var(--ink)] text-foreground">
      <AccountChrome
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={username}
      />
      <div className="lg:pl-[268px]">
        <div className="h-14" aria-hidden="true" />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
