import { after } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { prisma } from "@/lib/prisma";
import { apiSendMailSchema } from "@/lib/schemas/mail-message.schemas";
import { authenticateMailApi } from "@/lib/services/mail-api-auth.service";
import { composeMail } from "@/lib/services/mail-compose.service";
import { dispatchMailDelivery } from "@/lib/services/mail-dispatch.service";

function parseSenderAddress(from: string): { address: string; name?: string } {
  const match = from.match(/^(?:([^<]+)\s*)?<([^>]+)>$/);
  if (match) {
    const name = match[1]?.trim().replace(/^["']|["']$/g, "");
    const address = match[2]?.trim().toLowerCase();
    return { address: address ?? from.trim().toLowerCase(), name };
  }
  return { address: from.trim().toLowerCase() };
}

export async function POST(request: Request) {
  try {
    const credential = await authenticateMailApi(request);
    const input = await parseBody(request, apiSendMailSchema);

    let mailbox: { id: string; address: string; name: string } | null = null;
    let senderName = input.fromName;

    if (input.mailboxId) {
      mailbox = await prisma.mailbox.findFirst({
        where: {
          id: input.mailboxId,
          userId: credential.userId,
          ...(credential.projectId ? { projectId: credential.projectId } : {}),
        },
        select: { id: true, address: true, name: true },
      });
      if (!mailbox) throw new Error("Mailbox is outside this credential scope");
    } else if (input.from) {
      const parsed = parseSenderAddress(input.from);
      if (!senderName && parsed.name) {
        senderName = parsed.name;
      }
      mailbox = await prisma.mailbox.findFirst({
        where: {
          address: parsed.address,
          userId: credential.userId,
          status: "active",
          ...(credential.projectId ? { projectId: credential.projectId } : {}),
        },
        select: { id: true, address: true, name: true },
      });
      if (!mailbox) {
        throw new Error(
          `No active mailbox found for sender "${parsed.address}". Please ensure this domain is verified and a mailbox exists for this address.`,
        );
      }
    } else {
      const mailboxes = await prisma.mailbox.findMany({
        where: {
          userId: credential.userId,
          status: "active",
          ...(credential.projectId ? { projectId: credential.projectId } : {}),
        },
        select: { id: true, address: true, name: true },
        take: 2,
      });
      if (mailboxes.length === 1 && mailboxes[0]) {
        mailbox = mailboxes[0];
      } else if (mailboxes.length > 1) {
        throw new Error(
          "Multiple active mailboxes exist. Please specify 'from' or 'mailboxId'.",
        );
      } else {
        throw new Error(
          "No active mailbox found for this project. Please create a mailbox first.",
        );
      }
    }

    const { from: _from, ...composeInput } = input;
    const message = await composeMail(
      credential.userId,
      {
        ...composeInput,
        mailboxId: mailbox.id,
        fromName: senderName ?? mailbox.name,
      },
      undefined,
      true,
    );

    if (credential.mode === "test") {
      await prisma.mailMessage.update({
        where: { id: message.id },
        data: { status: "test" },
      });
      return ok({ id: message.id, status: "test" }, 202);
    }
    if (!message.scheduledAt)
      after(() => dispatchMailDelivery(credential.userId, message.id));
    return ok({ id: message.id, status: message.status }, 202);
  } catch (error) {
    return fail(error);
  }
}
