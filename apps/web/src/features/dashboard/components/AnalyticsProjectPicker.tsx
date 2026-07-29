import { ProjectSectionPicker } from "@/features/dashboard/components/ProjectSectionPicker";
import type { DashboardProject } from "@/features/dashboard/types/project.types";

export function AnalyticsProjectPicker({
  username,
  projects,
}: {
  username: string;
  projects: DashboardProject[];
}) {
  return (
    <ProjectSectionPicker
      projects={projects}
      section="analytics"
      title="Analytics"
      username={username}
    />
  );
}
