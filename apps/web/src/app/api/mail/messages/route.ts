import { after } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { composeMailSchema } from "@/lib/schemas/mail-message.schemas";
import { composeMail } from "@/lib/services/mail-compose.service";
import { dispatchMailDelivery } from "@/lib/services/mail-dispatch.service";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, composeMailSchema);
    const message = await composeMail(userId, input);
    if (!message.scheduledAt) {
      // await it directly for immediate debugging
      await dispatchMailDelivery(userId, message.id).catch(e => {
        console.error("Mail delivery error:", e);
      });
    }
    return ok(
      { id: message.id, status: message.status, createdAt: message.createdAt },
      202,
    );
  } catch (error) {
    return fail(error);
  }
}
