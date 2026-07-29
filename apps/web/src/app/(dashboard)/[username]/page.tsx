import { notFound, redirect } from "next/navigation";
import { ProjectsBackground } from "@/features/dashboard/components/ProjectsBackground";
import { ProjectsGrid } from "@/features/dashboard/components/ProjectsGrid";
import { getServerSession } from "@/lib/auth/session";
import { dashboardProjects } from "@/lib/services/dashboard.service";

/**
 * Account overview (all-projects scope) — served at /[username].
 */
export default function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = resolveUsername(params);
  const projects = loadProjects(params);

  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <ProjectsBackground />
      <div className="relative z-10 w-full px-5 py-8 lg:px-8">
        <ProjectsGrid username={username} projects={projects} />
      </div>
    </div>
  );
}

async function resolveUsername(params: Promise<{ username: string }>) {
  return (await params).username;
}

async function loadProjects(params: Promise<{ username: string }>) {
  const [{ username }, session] = await Promise.all([
    params,
    getServerSession(),
  ]);
  if (!session) redirect("/login");
  if (session.user.username !== username) notFound();
  return dashboardProjects(username);
}
