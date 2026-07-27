import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectOverviewPage } from "@/features/dashboard/components/ProjectOverviewPage";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { auth } from "@/lib/auth";
import { getProjectOverview } from "@/lib/services/project-overview.service";
import { NotFoundError } from "@multivrs/error-utils";
import type { ProjectOverviewData } from "@/features/dashboard/types/project-overview.types";

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

  let data: ProjectOverviewData;
  try {
    data = await getProjectOverview(session.user.id, username, scope);
  } catch (err) {
    if (err instanceof NotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <ProjectOverviewPage
      username={username}
      data={data}
    />
  );
}
