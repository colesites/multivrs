import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  createMailboxSchema,
  updateMailboxSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";
import {
  accessibleMailbox,
  mailAccount,
} from "@/lib/services/mail-access.service";

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

/**
 * A mailbox in the account the request works in. A personal mailbox's
 * creator becomes its member, so only they see it.
 */
export async function createMailbox(actorId: string, input: MailboxInput) {
  const { account, ...fields } = input;
  const { ownerId } = await mailAccount(actorId, {
    projectId: fields.projectId,
    account,
  });
  const project = fields.projectId
    ? await prisma.project.findUniqueOrThrow({
        where: { id: fields.projectId },
        select: { organizationId: true },
      })
    : null;
  const current = await prisma.mailbox.count({
    where: project?.organizationId
      ? { project: { organizationId: project.organizationId } }
      : { userId: ownerId },
  });
  await assertResourceAvailable({
    current,
    projectId: fields.projectId,
    resource: "mailboxes",
    userId: ownerId,
  });
  const domainName = fields.address.split("@")[1];
  const domain = domainName
    ? await prisma.mailDomain.findFirst({
        where: { userId: ownerId, domain: domainName },
      })
    : null;
  return prisma.mailbox.create({
    data: {
      ...fields,
      userId: ownerId,
      domainId: domain?.id,
      ...(fields.kind === "personal"
        ? { members: { create: { userId: actorId, role: "owner" } } }
        : {}),
    },
  });
}

/**
 * Renames a mailbox or changes its kind. Making it personal hides it from
 * the rest of the team, so the person who does it becomes its member.
 */
export async function updateMailbox(
  actorId: string,
  mailboxId: string,
  input: z.infer<typeof updateMailboxSchema>,
) {
  await accessibleMailbox(actorId, mailboxId, "manage");
  return prisma.mailbox.update({
    where: { id: mailboxId },
    data: {
      name: input.name,
      kind: input.kind,
      ...(input.kind === "personal"
        ? {
            members: {
              upsert: {
                where: { mailboxId_userId: { mailboxId, userId: actorId } },
                create: { userId: actorId, role: "owner" },
                update: {},
              },
            },
          }
        : {}),
    },
    select: { id: true, name: true, kind: true },
  });
}

export async function deleteMailbox(actorId: string, mailboxId: string) {
  await accessibleMailbox(actorId, mailboxId, "manage");
  return prisma.mailbox.delete({
    where: { id: mailboxId },
  });
}
