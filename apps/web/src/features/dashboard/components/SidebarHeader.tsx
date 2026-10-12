import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface SidebarHeaderProps {
  workspace: CurrentWorkspace;
  workspaces: DashboardWorkspace[];
}

/**
 * Sidebar top region — the workspace switcher. Fixed to h-14 with a bottom
 * hairline so its separator lines up exactly with the content topbar's.
 */
export function SidebarHeader({ workspace, workspaces }: SidebarHeaderProps) {
  return (
    <div className="flex h-14 shrink-0 items-center border-b border-[var(--hairline)] px-3">
      <WorkspaceSwitcher workspace={workspace} workspaces={workspaces} />
    </div>
  );
}
