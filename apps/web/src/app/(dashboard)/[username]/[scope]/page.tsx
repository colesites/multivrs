import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProjectOverviewPage } from "@/features/dashboard/components/ProjectOverviewPage";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { auth } from "@/lib/auth";
import { getProjectOverview } from "@/lib/services/project-overview.service";

export default async function ScopeOverviewPage({
  params,
}: {
  params: Promise<{ username: string; scope: string }>;
}) {
  const { username, scope } = await params;

  if (scope === ALL_PROJECTS_SCOPE) {
    redirect(`/${username}`);
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return (
    <ProjectOverviewPage
      username={username}
      data={await getProjectOverview(session.user.id, username, scope)}
    />
  );
}
