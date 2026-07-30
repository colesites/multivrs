import { dashboardProjects } from "@/lib/services/dashboard.service";
import { listNotifications } from "@/lib/services/notification.service";
import { DashboardMobileNavigation } from "./DashboardMobileNavigation";
import { DashboardTopbar } from "./DashboardTopbar";
import { Sidebar } from "./Sidebar";

interface AccountChromeProps {
  user: { id: string; name: string; email: string; image?: string | null };
  workspaceName: string;
}

export function AccountChrome({ user, workspaceName }: AccountChromeProps) {
  const projects = loadProjectOptions(workspaceName, user.id);
  const notifications = listNotifications(user.id);
  const publicUser = { name: user.name, email: user.email, image: user.image };

  return (
    <>
      <Sidebar
        user={publicUser}
        workspaceName={workspaceName}
        notifications={notifications}
      />
      <div className="fixed inset-x-0 top-0 z-30 lg:left-[268px]">
        <DashboardTopbar
          mobileNavigation={
            <DashboardMobileNavigation
              notifications={notifications}
              user={publicUser}
              workspaceName={workspaceName}
            />
          }
          projects={projects}
        />
      </div>
    </>
  );
}

async function loadProjectOptions(workspaceName: string, viewerId: string) {
  const projects = await dashboardProjects(workspaceName, viewerId);
  return (projects ?? []).map(({ slug, name }) => ({ slug, name }));
}
