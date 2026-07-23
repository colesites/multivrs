import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AnalyticsPage } from "@/features/dashboard/components/AnalyticsPage";
import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import { DeploymentsPage } from "@/features/dashboard/components/DeploymentsPage";
import { DomainsPage } from "@/features/dashboard/components/DomainsPage";
import { LogsPage } from "@/features/dashboard/components/LogsPage";
import { SectionPlaceholder } from "@/features/dashboard/components/SectionPlaceholder";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { getSectionMeta } from "@/features/dashboard/constants/sections";
import { auth } from "@/lib/auth";
import { listApiTokens } from "@/lib/services/api-token.service";
import {
  dashboardDeployments,
  dashboardProjects,
} from "@/lib/services/dashboard.service";
import {
  dashboardDomains,
  domainProjectOptions,
} from "@/lib/services/domain.service";

/**
 * Section pages, e.g. /c-tech/~/cdn (all projects) or
 * /c-tech/kontinue-ai/cdn (one project). `scope` is `~` or a project slug.
 */
export default async function SectionPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; section: string }>;
}) {
  const { username, scope, section } = await params;
  const meta = getSectionMeta(section);
  if (!meta) {
    notFound();
  }

  if (section === "deployments") {
    const deployments = await dashboardDeployments(
      username,
      scope === ALL_PROJECTS_SCOPE ? undefined : scope,
    );
    if (!deployments) notFound();
    return <DeploymentsPage deployments={deployments} />;
  }

  if (section === "logs") {
    const projects = await dashboardProjects(username);
    if (!projects) notFound();
    return (
      <LogsPage
        username={username}
        projects={projects}
        projectSlug={scope === ALL_PROJECTS_SCOPE ? undefined : scope}
      />
    );
  }

  if (section === "analytics") {
    const projects = await dashboardProjects(username);
    if (!projects) notFound();
    const project =
      scope === ALL_PROJECTS_SCOPE
        ? undefined
        : projects.find((item) => item.slug === scope);
    if (scope !== ALL_PROJECTS_SCOPE && !project) notFound();
    return (
      <AnalyticsPage
        username={username}
        projects={projects}
        project={project}
      />
    );
  }

  if (section === "settings" && scope === ALL_PROJECTS_SCOPE) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) notFound();
    return (
      <ApiTokensPage initialTokens={await listApiTokens(session.user.id)} />
    );
  }

  if (section === "domains") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) notFound();
    const projectSlug = scope === ALL_PROJECTS_SCOPE ? undefined : scope;
    const [domains, projects] = await Promise.all([
      dashboardDomains(session.user.id, projectSlug),
      domainProjectOptions(session.user.id, projectSlug),
    ]);
    return (
      <DomainsPage
        domains={domains}
        projects={projects}
        teamSlug={username}
        scope={scope}
      />
    );
  }

  const scopeLabel = scope === ALL_PROJECTS_SCOPE ? "All Projects" : scope;

  return (
    <SectionPlaceholder
      title={meta.title}
      description={meta.description}
      scopeLabel={scopeLabel}
    />
  );
}
