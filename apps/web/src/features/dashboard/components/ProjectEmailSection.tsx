import { MultivrsMailPage } from "@/features/mail/MultivrsMailPage";
import { MailProvider } from "@/features/mail/mail-context";
import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import { mailDashboard } from "@/lib/services/mail-dashboard.service";

export async function ProjectEmailSection({
  scope,
  userId,
  username,
}: {
  scope: string;
  userId: string;
  username: string;
}) {
  if (scope === ALL_PROJECTS_SCOPE) {
    const data = await mailDashboard(userId);
    return (
      <MailProvider data={data}>
        <MultivrsMailPage />
      </MailProvider>
    );
  }
  const project = await getScopedProject(userId, username, scope);
  const data = await mailDashboard(userId, project.id);
  return (
    <MailProvider data={data} projectId={project.id}>
      <MultivrsMailPage />
    </MailProvider>
  );
}

