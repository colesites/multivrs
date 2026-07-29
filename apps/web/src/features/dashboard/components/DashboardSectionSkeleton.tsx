"use client";

import { usePathname } from "next/navigation";
import { MailPageSkeleton } from "@/features/mail/MailPageSkeleton";
import { AnalyticsSectionSkeleton } from "./skeletons/AnalyticsSectionSkeleton";
import { CdnSectionSkeleton } from "./skeletons/CdnSectionSkeleton";
import {
  DeploymentsSectionSkeleton,
  DomainsSectionSkeleton,
  SandboxesSectionSkeleton,
} from "./skeletons/DataSectionSkeletons";
import { EnvironmentSectionSkeleton } from "./skeletons/EnvironmentSectionSkeleton";
import { FirewallSectionSkeleton } from "./skeletons/FirewallSectionSkeleton";
import { IntegrationsSectionSkeleton } from "./skeletons/IntegrationsSectionSkeleton";
import { LogsSectionSkeleton } from "./skeletons/LogsSectionSkeleton";
import { ObservabilitySectionSkeleton } from "./skeletons/ObservabilitySectionSkeleton";
import { ProjectSectionPickerSkeleton } from "./ProjectSectionPicker";
import { ProjectPickerSkeleton } from "./skeletons/SectionSkeletonParts";
import { SettingsSectionSkeleton } from "./skeletons/SettingsSectionSkeleton";
import { SpeedInsightsSectionSkeleton } from "./skeletons/SpeedInsightsSectionSkeleton";

export function DashboardSectionSkeleton({
  requestedScope,
  requestedSection,
}: {
  requestedScope?: string;
  requestedSection?: string;
} = {}) {
  const segments = usePathname().split("/").filter(Boolean);
  const section = requestedSection ?? segments.at(-1);
  const scope = requestedScope ?? segments.at(-2);

  if (section === "emails" || section === "email") return <MailPageSkeleton />;
  if (section === "settings")
    return <SettingsSectionSkeleton account={scope === "~"} />;
  if (section === "deployments") return <DeploymentsSectionSkeleton />;
  if (section === "domains") return <DomainsSectionSkeleton />;
  if (scope === "~" && section) {
    const title = sectionTitle(section);
    return <ProjectSectionPickerSkeleton section={section} title={title} />;
  }
  if (section === "logs") return <LogsSectionSkeleton />;
  if (section === "analytics") return <AnalyticsSectionSkeleton />;
  if (section === "speed-insights") return <SpeedInsightsSectionSkeleton />;
  if (section === "observability") return <ObservabilitySectionSkeleton />;
  if (section === "firewall") return <FirewallSectionSkeleton />;
  if (section === "cdn") return <CdnSectionSkeleton />;
  if (section === "environment-variables")
    return <EnvironmentSectionSkeleton />;
  if (section === "integrations") return <IntegrationsSectionSkeleton />;
  if (section === "sandboxes") return <SandboxesSectionSkeleton />;
  return <ProjectPickerSkeleton />;
}

function sectionTitle(section: string): string {
  if (section === "speed-insights") return "Speed Insights";
  if (section === "cdn") return "CDN";
  return section.charAt(0).toUpperCase() + section.slice(1);
}
