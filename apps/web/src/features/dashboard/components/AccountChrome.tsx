import type { CurrentWorkspace } from "@/features/dashboard/types/workspace.types";
import {
  dashboardWorkspaces,
  workspaceOwner,
} from "@/lib/services/account-team.service";
import { accountPlan } from "@/lib/services/billing-entitlement.service";
import { dashboardProjectOptions } from "@/lib/services/dashboard.service";
import { listNotifications } from "@/lib/services/notification.service";
import { DashboardMobileNavigation } from "./DashboardMobileNavigation";
import { DashboardTopbar } from "./DashboardTopbar";
import { Sidebar } from "./Sidebar";

interface AccountChromeProps {
  user: { id: string; name: string; email: string; image?: string | null };
  workspaceName: string;
}

export async function AccountChrome({
  user,
  workspaceName,
}: AccountChromeProps) {
  const [projects, notifications, plan, owner, workspaces] = await Promise.all([
    loadProjectOptions(workspaceName, user.id),
    listNotifications(user.id),
    accountPlan(workspaceName).catch((error: unknown) => {
      console.error("[AccountChrome] accountPlan error:", error);
      return undefined;
    }),
    workspaceOwner(workspaceName),
    dashboardWorkspaces(user.id),
  ]);
  const publicUser = { name: user.name, email: user.email, image: user.image };
  // The header shows the account being viewed, not the viewer.
  const current: CurrentWorkspace = {
    username: workspaceName,
    name: owner?.name ?? workspaceName,
    image: owner?.image ?? null,
    plan,
  };

  return (
    <>
      <Sidebar
        user={publicUser}
        workspace={current}
        workspaces={workspaces}
        notifications={notifications}
      />
      <div className="fixed inset-x-0 top-0 z-30 lg:left-[268px]">
        <DashboardTopbar
          mobileNavigation={
            <DashboardMobileNavigation
              notifications={notifications}
              user={publicUser}
              workspace={current}
              workspaces={workspaces}
            />
          }
          projects={projects}
        />
      </div>
    </>
  );
}

async function loadProjectOptions(workspaceName: string, viewerId: string) {
  return dashboardProjectOptions(workspaceName, viewerId);
}
