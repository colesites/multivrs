import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { createNotification } from "@/lib/services/notification.service";

export async function notifyDeploymentStatus(
  userId: string,
  projectId: string,
  deploymentId: string,
  status: "canceled" | "error" | "ready",
): Promise<void> {
  const project = await prisma.project.findUnique({
    select: { name: true, owner: { select: { username: true } }, slug: true },
    where: { id: projectId },
  });
  if (!project) return;
  const isReady = status === "ready";
  const title = isReady ? "Deployment ready" : `Deployment ${status}`;
  const username = project.owner.username;
  await Promise.all([
    createNotification({
      href: username
        ? `/${username}/${project.slug}/deployments/${deploymentId}`
        : undefined,
      message: `${project.name} ${isReady ? "is live" : `finished with status ${status}`}.`,
      title,
      type: isReady ? "success" : status === "error" ? "error" : "warning",
      userId,
    }),
    recordAuditEvent({
      action: `deployment.${status}`,
      entityId: deploymentId,
      entityType: "deployment",
      projectId,
      userId,
    }),
  ]);
}
