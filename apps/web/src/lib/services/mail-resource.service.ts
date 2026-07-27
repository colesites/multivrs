import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { createMailboxSchema } from "@/lib/schemas/mail-resource.schemas";
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
