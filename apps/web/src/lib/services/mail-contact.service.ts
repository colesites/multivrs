import "server-only";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import type {
  createMailAudienceSchema,
  createMailContactSchema,
} from "@/lib/schemas/mail-resource.schemas";
import { mailAccount } from "@/lib/services/mail-access.service";

export async function createContact(
  actorId: string,
  input: z.infer<typeof createMailContactSchema>,
) {
  const { audienceIds, account: _, ...contact } = input;
  const { ownerId: userId } = await mailAccount(actorId, input);
  return prisma.$transaction(async (tx) => {
    const [saved, audiences] = await Promise.all([
      tx.mailContact.upsert({
        where: { userId_email: { userId, email: contact.email } },
        create: { ...contact, userId, consentAt: new Date() },
        update: contact,
      }),
      tx.mailAudience.findMany({
        where: { id: { in: audienceIds }, userId },
        select: { id: true },
      }),
    ]);
    await Promise.all(
      audiences.map((audience) =>
        tx.mailAudienceMember.upsert({
          where: {
            audienceId_contactId: {
              audienceId: audience.id,
              contactId: saved.id,
            },
          },
          create: { audienceId: audience.id, contactId: saved.id },
          update: { subscriptionState: "subscribed" },
        }),
      ),
    );
    return saved;
  });
}

export async function createAudience(
  actorId: string,
  input: z.infer<typeof createMailAudienceSchema>,
) {
  const { account: _, ...fields } = input;
  const { ownerId } = await mailAccount(actorId, input);
  return prisma.mailAudience.create({ data: { ...fields, userId: ownerId } });
}
