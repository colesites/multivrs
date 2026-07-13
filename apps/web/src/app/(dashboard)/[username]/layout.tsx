import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/features/dashboard/components/DashboardTopbar";
import { Sidebar } from "@/features/dashboard/components/Sidebar";
import { SAMPLE_PROJECTS } from "@/features/dashboard/constants/sample-projects";
import { auth } from "@/lib/auth";

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

  return (
    <div className="dashboard-surface min-h-screen bg-[var(--ink)] text-foreground">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={username}
      />
      <div className="pl-[268px]">
        <DashboardTopbar
          projects={SAMPLE_PROJECTS.map((p) => ({
            slug: p.slug,
            name: p.name,
          }))}
        />
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
