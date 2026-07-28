import "server-only";
import { sanitizeMailHtml } from "@/lib/mail/sanitize-html";
import { prisma } from "@/lib/prisma";
import type { InboundMailInput } from "@/lib/schemas/mail-message.schemas";

export async function repairInboundBody(
  userId: string,
  messageId: string | null,
  input: InboundMailInput,
) {
  if (!messageId || (!input.text && !input.html)) return false;
  const result = await prisma.mailMessage.updateMany({
    where: {
      id: messageId,
      userId,
      direction: "inbound",
      AND: [
        { OR: [{ textBody: null }, { textBody: "" }] },
        { OR: [{ htmlBody: null }, { htmlBody: "" }] },
      ],
    },
    data: {
      textBody: input.text,
      htmlBody: input.html,
      sanitizedHtml: sanitizeMailHtml(input.html),
      headers: input.headers,
    },
  });
  return result.count > 0;
}
