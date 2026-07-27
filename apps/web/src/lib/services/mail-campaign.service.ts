import "server-only";
import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  createMailAutomationSchema,
  createMailBroadcastSchema,
  createMailTemplateSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { assertMailProject } from "@/lib/services/mail-access.service";

export async function createTemplate(
  userId: string,
  input: z.infer<typeof createMailTemplateSchema>,
) {
  await assertMailProject(userId, input.projectId);
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
  userId: string,
  input: z.infer<typeof createMailBroadcastSchema>,
) {
  await assertMailProject(userId, input.projectId);
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
  userId: string,
  input: z.infer<typeof createMailAutomationSchema>,
) {
  await assertMailProject(userId, input.projectId);
  return prisma.mailAutomation.create({ data: { ...input, userId } });
}
