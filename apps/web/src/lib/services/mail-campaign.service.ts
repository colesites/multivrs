import "server-only";
import { randomUUID } from "node:crypto";
import { NotFoundError } from "@multivrs/error-utils";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  createMailAutomationSchema,
  createMailBroadcastSchema,
  createMailTemplateSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { mailAccount } from "@/lib/services/mail-access.service";

export async function createTemplate(
  actorId: string,
  input: z.infer<typeof createMailTemplateSchema>,
) {
  const { ownerId: userId } = await mailAccount(actorId, input);
  return prisma.mailTemplate.create({
    data: {
      name: input.name,
      projectId: input.projectId,
      userId,
      versions: {
        create: {
          version: 1,
          subject: input.subject,
          previewText: input.previewText,
          html: input.html,
          text: input.text,
          variables: input.variables,
        },
      },
    },
    include: { versions: true },
  });
}

export async function createBroadcast(
  actorId: string,
  input: z.infer<typeof createMailBroadcastSchema>,
) {
  const { ownerId: userId } = await mailAccount(actorId, input);
  // The audience and template must be this account's own.
  const [audience, version] = await Promise.all([
    prisma.mailAudience.findFirst({
      where: { id: input.audienceId, userId },
      select: { id: true },
    }),
    input.templateVersionId
      ? prisma.mailTemplateVersion.findFirst({
          where: { id: input.templateVersionId, template: { userId } },
          select: { id: true },
        })
      : null,
  ]);
  if (!audience) throw new NotFoundError("Audience not found");
  if (input.templateVersionId && !version) {
    throw new NotFoundError("Template not found");
  }
  return prisma.$transaction(async (tx) => {
    let templateVersionId = input.templateVersionId;
    if (!templateVersionId) {
      const template = await tx.mailTemplate.create({
        data: {
          userId,
          projectId: input.projectId,
          name: `${input.name} · ${randomUUID().slice(0, 8)}`,
          status: "active",
          versions: {
            create: {
              version: 1,
              subject: input.subject,
              html: `<div>${input.body}</div>`,
              text: input.body,
              variables: [],
            },
          },
        },
        include: { versions: true },
      });
      templateVersionId = template.versions[0]?.id;
    }
    return tx.mailBroadcast.create({
      data: {
        userId,
        projectId: input.projectId,
        name: input.name,
        subject: input.subject,
        fromAddress: input.fromAddress,
        audienceId: input.audienceId,
        templateVersionId,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        status: input.scheduledAt ? "scheduled" : "draft",
      },
    });
  });
}

export async function createAutomation(
  actorId: string,
  input: z.infer<typeof createMailAutomationSchema>,
) {
  const { account: _, ...fields } = input;
  const { ownerId } = await mailAccount(actorId, input);
  return prisma.mailAutomation.create({
    data: { ...fields, userId: ownerId },
  });
}
