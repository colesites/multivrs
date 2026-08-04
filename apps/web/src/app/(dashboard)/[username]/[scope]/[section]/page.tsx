import { notFound } from "next/navigation";
import { DeploymentsPage } from "@/features/dashboard/components/DeploymentsPage";
import { DomainsPage } from "@/features/dashboard/components/DomainsPage";
import { LogsPage } from "@/features/dashboard/components/LogsPage";
import { PlatformSectionStream } from "@/features/dashboard/components/PlatformSectionStream";
import { ProjectSettingsPage } from "@/features/dashboard/components/ProjectSettingsPage";
import { SectionPlaceholder } from "@/features/dashboard/components/SectionPlaceholder";
import { SettingsPage } from "@/features/dashboard/components/SettingsPage";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { getSectionMeta } from "@/features/dashboard/constants/sections";
import { isPlatformProjectSection } from "@/features/dashboard/lib/project-platform-sections";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import { getServerSession } from "@/lib/auth/session";
import { getAccountProfile } from "@/lib/services/account.service";
import { listApiTokens } from "@/lib/services/api-token.service";
import { listAuditEvents } from "@/lib/services/audit-event.service";
import { getBillingOverview } from "@/lib/services/billing-overview.service";
import {
  dashboardDeployments,
  dashboardProjects,
} from "@/lib/services/dashboard.service";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import {
  dashboardDomains,
  domainProjectOptions,
} from "@/lib/services/domain.service";
import { getProject } from "@/lib/services/project.service";
import { listProjectRuntimeLogs } from "@/lib/services/runtime-log.service";

/**
 * Section pages, e.g. /c-tech/~/cdn (all projects) or
 * /c-tech/kontinue-ai/cdn (one project). `scope` is `~` or a project slug.
 */
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; scope: string; section: string }>;
  searchParams: Promise<{ compose?: string; range?: string; view?: string }>;
}) {
  const { username, scope, section } = await params;
  const meta = getSectionMeta(section);
  if (!meta) {
    notFound();
  }

  if (section === "deployments") {
    const session = await getServerSession();
    if (!session) notFound();
    const deployments = dashboardDeployments(
      session.user.id,
      username,
      scope === ALL_PROJECTS_SCOPE ? undefined : scope,
    );
    return <DeploymentsPage deployments={deployments} />;
  }

  if (section === "logs") {
    const session = await getServerSession();
    if (!session) notFound();
    const projects = await dashboardProjects(username, session.user.id);
    if (!projects) notFound();
    return (
      <LogsPage
        username={username}
        projects={projects}
        projectSlug={scope === ALL_PROJECTS_SCOPE ? undefined : scope}
        logs={
          scope === ALL_PROJECTS_SCOPE
            ? []
            : await listProjectRuntimeLogs(session.user.id, username, scope)
        }
      />
    );
  }

  if (section === "settings" && scope === ALL_PROJECTS_SCOPE) {
    const session = await getServerSession();
    if (!session) notFound();
    const [billing, events, profile, tokens] = await Promise.all([
      getBillingOverview(session.user.id),
      listAuditEvents(session.user.id),
      getAccountProfile(session.user.id),
      listApiTokens(session.user.id),
    ]);
    return (
      <SettingsPage
        billing={billing}
        events={events}
        profile={profile}
        tokens={tokens}
        twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      />
    );
  }

  if (section === "settings") {
    const session = await getServerSession();
    if (!session) notFound();
    const scopedProject = await getScopedProject(
      session.user.id,
      username,
      scope,
    );
    const project = await getProject(session.user.id, scopedProject.id);
    return (
      <ProjectSettingsPage
        key={project.id}
        project={project}
        username={username}
      />
    );
  }

  if (section === "domains") {
    const session = await getServerSession();
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

  if (isPlatformProjectSection(section)) {
    const mailSearch = await searchParams;
    return (
      <PlatformSectionStream
        compose={mailSearch.compose}
        analyticsRange={parseAnalyticsRange(mailSearch.range)}
        meta={meta}
        requestedView={mailSearch.view}
        scope={scope}
        section={section}
        username={username}
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

function parseAnalyticsRange(value: string | undefined): AnalyticsRange {
  return value === "7d" || value === "30d" ? value : "24h";
}
