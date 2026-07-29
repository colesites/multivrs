import { after } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { prisma } from "@/lib/prisma";
import { smtpSubmissionSchema } from "@/lib/schemas/mail-message.schemas";
import { authenticateMailCredential } from "@/lib/services/mail-api-auth.service";
import { composeMail } from "@/lib/services/mail-compose.service";
import { dispatchMailDelivery } from "@/lib/services/mail-dispatch.service";

export async function POST(request: Request) {
  try {
    const credential = await authenticateMailCredential(request, "smtp");
    const input = await parseBody(request, smtpSubmissionSchema);
    const mailbox = await prisma.mailbox.findFirst({
      where: {
        address: input.from,
        userId: credential.userId,
        status: "active",
        ...(credential.projectId ? { projectId: credential.projectId } : {}),
      },
      select: { id: true },
    });
    if (!mailbox)
      throw new Error("The SMTP sender is outside this credential scope");
    const message = await composeMail(credential.userId, {
      ...input,
      mailboxId: mailbox.id,
    });
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
