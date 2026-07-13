import type { DashboardProject } from "@/features/dashboard/types/project.types";
import { LogsProjectPicker } from "./LogsProjectPicker";
import { ProjectLogsConsole } from "./ProjectLogsConsole";

export function LogsPage({
  username,
  projects,
  projectSlug,
}: {
  username: string;
  projects: DashboardProject[];
  projectSlug?: string;
}) {
  const project = projects.find((item) => item.slug === projectSlug);
  return project ? (
    <ProjectLogsConsole project={project.name} />
  ) : (
    <LogsProjectPicker username={username} projects={projects} />
  );
}
