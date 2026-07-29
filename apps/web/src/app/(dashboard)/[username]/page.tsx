import { notFound, redirect } from "next/navigation";
import { ProjectsGrid } from "@/features/dashboard/components/ProjectsGrid";
import { getServerSession } from "@/lib/auth/session";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { getAccountUsage } from "@/lib/services/account-usage.service";

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
  const usage = loadUsage(params);

  return (
    <div className="relative isolate flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="relative z-10 w-full px-5 py-8 lg:px-8">
        <ProjectsGrid username={username} projects={projects} usage={usage} />
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

async function loadUsage(params: Promise<{ username: string }>) {
  const [{ username }, session] = await Promise.all([
    params,
    getServerSession(),
  ]);
  if (!session) redirect("/login");
  if (session.user.username !== username) notFound();
  return getAccountUsage(session.user.id);
}
