import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProjectsBackground } from "@/features/dashboard/components/ProjectsBackground";
import { ProjectsGrid } from "@/features/dashboard/components/ProjectsGrid";
import { auth } from "@/lib/auth";
import { getAccountUsage } from "@/lib/services/account-usage.service";
import { dashboardProjects } from "@/lib/services/dashboard.service";

/**
 * Account overview (all-projects scope) — served at /[username].
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [{ username }, requestHeaders] = await Promise.all([params, headers()]);
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session || session.user.username !== username) notFound();
  const [projects, usage] = await Promise.all([
    dashboardProjects(username),
    getAccountUsage(session.user.id),
  ]);
  if (!projects) notFound();

  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <ProjectsBackground />
      <div className="relative z-10 w-full px-5 py-8 lg:px-8">
        <ProjectsGrid username={username} projects={projects} usage={usage} />
      </div>
    </div>
  );
}
