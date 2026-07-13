import { notFound } from "next/navigation";
import { ProjectsBackground } from "@/features/dashboard/components/ProjectsBackground";
import { ProjectsGrid } from "@/features/dashboard/components/ProjectsGrid";
import { dashboardProjects } from "@/lib/services/dashboard.service";

/**
 * Account overview (all-projects scope) — served at /[username].
 */
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const projects = await dashboardProjects(username);
  if (!projects) notFound();

  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <ProjectsBackground />
      <div className="relative z-10 w-full px-5 py-8 lg:px-8">
        <ProjectsGrid username={username} projects={projects} />
      </div>
    </div>
  );
}
