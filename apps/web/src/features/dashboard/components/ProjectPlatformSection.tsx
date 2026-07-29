import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AnalyticsPage } from "@/features/dashboard/components/AnalyticsPage";
import { CdnPage } from "@/features/dashboard/components/CdnPage";
import { EnvironmentVariablesPage } from "@/features/dashboard/components/EnvironmentVariablesPage";
import { FirewallPage } from "@/features/dashboard/components/FirewallPage";
import { IntegrationsPage } from "@/features/dashboard/components/IntegrationsPage";
import { ObservabilityPage } from "@/features/dashboard/components/ObservabilityPage";
import { ProjectEmailSection } from "@/features/dashboard/components/ProjectEmailSection";
import { ProjectSectionPicker } from "@/features/dashboard/components/ProjectSectionPicker";
import { SandboxesPage } from "@/features/dashboard/components/SandboxesPage";
import { SpeedInsightsPage } from "@/features/dashboard/components/SpeedInsightsPage";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import type { SectionMeta } from "@/features/dashboard/constants/sections";
import type { PlatformSection } from "@/features/dashboard/lib/project-platform-sections";
import type { MailView } from "@/features/mail/mail-navigation";
import { auth } from "@/lib/auth";
import {
  getProjectAnalytics,
  getProjectWebVitals,
} from "@/lib/services/analytics.service";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import { getEdgeSettings } from "@/lib/services/edge-settings.service";
import { listEnvironmentVariables } from "@/lib/services/environment-variable.service";
import { listFirewallRules } from "@/lib/services/firewall-rule.service";
import { getProjectObservability } from "@/lib/services/observability.service";
import { oidcIssuerOrStatus } from "@/lib/services/oidc.service";

export async function ProjectPlatformSection({
  meta,
  initialMailView = "overview",
  initialMailCompose = false,
  scope,
  section,
  username,
}: {
  meta: SectionMeta;
  initialMailView?: MailView;
  initialMailCompose?: boolean;
  scope: string;
  section: PlatformSection;
  username: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();
  const projects = await dashboardProjects(username);
  if (!projects) notFound();
  if (section === "emails") {
    return (
      <ProjectEmailSection
        scope={scope}
        initialView={initialMailView}
        initialCompose={initialMailCompose}
        userId={session.user.id}
        username={username}
      />
    );
  }
  if (scope === ALL_PROJECTS_SCOPE) {
    if (section === "analytics") {
      return <AnalyticsPage username={username} projects={projects} />;
    }
    return (
      <ProjectSectionPicker
        username={username}
        section={section}
        title={meta.title}
        projects={projects}
      />
    );
  }
  const selected = projects.find((project) => project.slug === scope);
  if (!selected) notFound();
  const project = await getScopedProject(session.user.id, username, scope);
  if (section === "analytics") {
    return (
      <AnalyticsPage
        project={selected}
        analytics={await getProjectAnalytics(project.id)}
      />
    );
  }
  if (section === "firewall") {
    return (
      <FirewallPage
        projectId={project.id}
        projectName={project.name}
        rules={await listFirewallRules(session.user.id, project.id)}
      />
    );
  }
  if (section === "cdn") {
    return (
      <CdnPage
        projectId={project.id}
        projectName={project.name}
        initialSettings={await getEdgeSettings(session.user.id, project.id)}
      />
    );
  }
  if (section === "environment-variables") {
    return (
      <EnvironmentVariablesPage
        projectId={project.id}
        projectName={project.name}
        variables={await listEnvironmentVariables(session.user.id, project.id)}
      />
    );
  }
  if (section === "integrations") {
    return (
      <IntegrationsPage
        issuer={oidcIssuerOrStatus()}
        projectId={project.id}
        projectName={project.name}
      />
    );
  }
  if (section === "sandboxes") {
    return <SandboxesPage projectId={project.id} projectName={project.name} />;
  }
  if (section === "speed-insights") {
    return (
      <SpeedInsightsPage
        projectName={project.name}
        vitals={await getProjectWebVitals(project.id)}
      />
    );
  }
  return (
    <ObservabilityPage
      projectName={project.name}
      data={await getProjectObservability(session.user.id, project.id)}
    />
  );
}
