import { ALL_PROJECTS_SCOPE } from "@/features/dashboard/constants/navigation";
import { MultivrsMailPage } from "@/features/mail/MultivrsMailPage";
import { MailProvider } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-navigation";
import { getScopedProject } from "@/lib/services/dashboard-scope.service";
import { mailAccount } from "@/lib/services/mail-access.service";
import { mailDashboard } from "@/lib/services/mail-dashboard.service";

export async function ProjectEmailSection({
  scope,
  initialView,
  initialCompose,
  userId,
  username,
}: {
  scope: string;
  initialView: MailView;
  initialCompose?: boolean;
  userId: string;
  username: string;
}) {
  if (scope === ALL_PROJECTS_SCOPE) {
    // The account in the URL: yours, or one whose team you're on.
    const { ownerId } = await mailAccount(
      userId,
      { account: username },
      "read",
    );
    const data = await mailDashboard(ownerId, userId);
    return (
      <MailProvider
        key={`all:${initialView}`}
        data={data}
        initialCompose={initialCompose}
        initialView={initialView}
      >
        <MultivrsMailPage />
      </MailProvider>
    );
  }
  const project = await getScopedProject(userId, username, scope);
  const { ownerId } = await mailAccount(
    userId,
    { projectId: project.id },
    "read",
  );
  const data = await mailDashboard(ownerId, userId, project.id);
  return (
    <MailProvider
      key={`${project.id}:${initialView}`}
      data={data}
      initialCompose={initialCompose}
      initialView={initialView}
      projectId={project.id}
    >
      <MultivrsMailPage />
    </MailProvider>
  );
}
