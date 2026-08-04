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
import { WorkflowsPage } from "@/features/dashboard/components/WorkflowsPage";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import type { SectionMeta } from "@/features/dashboard/constants/sections";
import type { PlatformSection } from "@/features/dashboard/lib/project-platform-sections";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import type { MailView } from "@/features/mail/mail-navigation";
import { auth } from "@/lib/auth";
import {
  getProjectAnalytics,
  getProjectWebVitals,
} from "@/lib/services/analytics.service";
import {
  entitledAnalyticsRange,
  getProjectBillingFeatures,
} from "@/lib/services/billing-feature-access.service";
import { getContentPlatform } from "@/lib/services/content-platform.service";
import { dashboardProjects } from "@/lib/services/dashboard.service";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import { getEdgeSettings } from "@/lib/services/edge-settings.service";
import { listEnvironmentVariables } from "@/lib/services/environment-variable.service";
import { listFirewallRules } from "@/lib/services/firewall-rule.service";
import { getProjectObservability } from "@/lib/services/observability.service";
import { oidcIssuerOrStatus } from "@/lib/services/oidc.service";
import { listPlatformWorkflows } from "@/lib/services/platform-workflow.service";

export async function ProjectPlatformSection({
  analyticsRange,
  meta,
  initialMailView = "overview",
  initialMailCompose = false,
  scope,
  section,
  username,
}: {
  analyticsRange: AnalyticsRange;
  meta: SectionMeta;
  initialMailView?: MailView;
  initialMailCompose?: boolean;
  scope: string;
  section: PlatformSection;
  username: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();
  const projects = await dashboardProjects(username, session.user.id);
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
    const features = await getProjectBillingFeatures(
      session.user.id,
      project.id,
    );
    const range = entitledAnalyticsRange(
      analyticsRange,
      features.webAnalyticsPlus,
    );
    return (
      <AnalyticsPage
        project={selected}
        analytics={
          await getProjectAnalytics(
            project.id,
            range,
            features.webAnalyticsPlus,
          )
        }
        plusEnabled={features.webAnalyticsPlus}
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
    const [initialSettings, initialContent] = await Promise.all([
      getEdgeSettings(session.user.id, project.id),
      getContentPlatform(session.user.id, project.id),
    ]);
    return (
      <CdnPage
        projectId={project.id}
        projectName={project.name}
        initialSettings={initialSettings}
        initialContent={initialContent}
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
  if (section === "workflows") {
    return (
      <WorkflowsPage
        projectId={project.id}
        projectName={project.name}
        workflows={await listPlatformWorkflows(session.user.id, project.id)}
      />
    );
  }
  if (section === "speed-insights") {
    const features = await getProjectBillingFeatures(
      session.user.id,
      project.id,
    );
    const range = entitledAnalyticsRange(
      analyticsRange,
      features.speedInsights,
    );
    return (
      <SpeedInsightsPage
        projectName={project.name}
        vitals={
          features.speedInsights
            ? await getProjectWebVitals(project.id, range)
            : {
                devices: [],
                metrics: [],
                range,
                routes: [],
                state: "locked",
              }
        }
      />
    );
  }
  const features = await getProjectBillingFeatures(session.user.id, project.id);
  const range = entitledAnalyticsRange(
    analyticsRange,
    features.observabilityPlus,
  );
  return (
    <ObservabilityPage
      plusEnabled={features.observabilityPlus}
      projectName={project.name}
      data={await getProjectObservability(session.user.id, project.id, range)}
    />
  );
}
