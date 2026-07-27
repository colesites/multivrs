import type { DashboardProject } from "@/features/dashboard/types/project.types";
import type { RuntimeLogItem } from "@/features/dashboard/types/runtime-log.types";
import { LogsProjectPicker } from "./LogsProjectPicker";
import { ProjectLogsConsole } from "./ProjectLogsConsole";

export function LogsPage({
  username,
  projects,
  projectSlug,
  logs = [],
}: {
  username: string;
  projects: DashboardProject[];
  projectSlug?: string;
  logs?: RuntimeLogItem[];
}) {
  const project = projects.find((item) => item.slug === projectSlug);
  return project ? (
    <ProjectLogsConsole project={project.name} logs={logs} />
  ) : (
    <LogsProjectPicker username={username} projects={projects} />
  );
}
