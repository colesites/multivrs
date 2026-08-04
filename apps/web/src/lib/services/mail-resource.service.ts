import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { createMailboxSchema } from "@/lib/schemas/mail-resource.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import { assertMailProject } from "@/lib/services/mail-access.service";

export {
  createAutomation,
  createBroadcast,
  createTemplate,
} from "@/lib/services/mail-campaign.service";
export {
  createAudience,
  createContact,
} from "@/lib/services/mail-contact.service";
export {
  createCredential,
  createWebhook,
} from "@/lib/services/mail-credential.service";

type MailboxInput = z.infer<typeof createMailboxSchema>;

export async function createMailbox(userId: string, input: MailboxInput) {
  await assertMailProject(userId, input.projectId);
  const project = input.projectId
    ? await prisma.project.findUniqueOrThrow({
        where: { id: input.projectId },
        select: { organizationId: true },
      })
    : null;
  const current = await prisma.mailbox.count({
    where: project?.organizationId
      ? { project: { organizationId: project.organizationId } }
      : { userId },
  });
  await assertResourceAvailable({
    current,
    projectId: input.projectId,
    resource: "mailboxes",
    userId,
  });
  const domainName = input.address.split("@")[1];
  const domain = domainName
    ? await prisma.mailDomain.findFirst({
        where: { userId, domain: domainName },
      })
    : null;
  return prisma.mailbox.create({
    data: { ...input, userId, domainId: domain?.id },
  });
}

export async function deleteMailbox(userId: string, mailboxId: string) {
  const mailbox = await prisma.mailbox.findFirst({
    where: { id: mailboxId, userId },
  });
  if (!mailbox) throw new Error("Mailbox not found");

  return prisma.mailbox.delete({
    where: { id: mailboxId },
  });
}
