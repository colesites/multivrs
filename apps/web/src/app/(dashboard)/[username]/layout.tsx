import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DashboardMobileNavigation } from "@/features/dashboard/components/DashboardMobileNavigation";
import { DashboardTopbar } from "@/features/dashboard/components/DashboardTopbar";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { auth } from "@/lib/auth";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { listNotifications } from "@/lib/services/notification.service";

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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const { username } = await params;
  if (session.user.username !== username) notFound();
  const [projects, notifications] = await Promise.all([
    dashboardProjects(username),
    listNotifications(session.user.id),
  ]);

  return (
    <div className="dashboard-surface min-h-screen bg-[var(--ink)] text-foreground">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={username}
        notifications={notifications}
      />
      <div className="lg:pl-[268px]">
        <DashboardTopbar
          mobileNavigation={
            <DashboardMobileNavigation
              notifications={notifications}
              user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
              }}
              workspaceName={username}
            />
          }
          projects={(projects ?? []).map((p) => ({
            slug: p.slug,
            name: p.name,
          }))}
        />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
