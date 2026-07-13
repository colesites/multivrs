import { redirect } from "next/navigation";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";

/**
 * Scope root. /c-tech/~ collapses to the account overview (/c-tech); a project
 * slug like /c-tech/kontinue-ai renders that project's overview.
 */
export default async function ScopeOverviewPage({
  params,
}: {
  params: Promise<{ username: string; scope: string }>;
}) {
  const { username, scope } = await params;

  if (scope === ALL_PROJECTS_SCOPE) {
    redirect(`/${username}`);
  }

  return (
    <>
      <DashboardPageHeader title={scope} description="Project overview." />
      <div className="px-5 py-8 text-[14px] text-muted-foreground">
        Overview for <span className="text-foreground">{scope}</span> is coming
        soon.
      </div>
    </>
  );
}
