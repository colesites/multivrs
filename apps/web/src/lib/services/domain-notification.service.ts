import "server-only";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { createNotification } from "@/lib/services/notification.service";

export async function notifyDomainRegistered(input: {
  domainId: string;
  hostname: string;
  userId: string;
  username: string | null;
}): Promise<void> {
  await Promise.all([
    createNotification({
      href: input.username
        ? `/${input.username}/~/domains/${input.hostname}`
        : undefined,
      message: `${input.hostname} is registered and available in your Domains dashboard.`,
      title: "Domain registered",
      type: "success",
      userId: input.userId,
    }),
    recordAuditEvent({
      action: "domain.registered",
      entityId: input.domainId,
      entityType: "domain",
      userId: input.userId,
    }),
  ]);
}
