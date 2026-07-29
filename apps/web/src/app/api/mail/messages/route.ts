import { after } from "next/server";
import { z } from "zod";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { composeMailSchema } from "@/lib/schemas/mail-message.schemas";
import { composeMail } from "@/lib/services/mail-compose.service";
import { dispatchMailDelivery } from "@/lib/services/mail-dispatch.service";
import { emptyMailTrash } from "@/lib/services/mail-trash.service";

const emptyTrashQuerySchema = z.object({ projectId: z.uuid().optional() });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, composeMailSchema);
    const message = await composeMail(userId, input);
    if (!message.scheduledAt) {
      after(() => dispatchMailDelivery(userId, message.id));
    }
    return ok(
      { id: message.id, status: message.status, createdAt: message.createdAt },
      202,
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const query = emptyTrashQuerySchema.parse({
      projectId: url.searchParams.get("projectId") || undefined,
    });
    return ok(await emptyMailTrash(await requireUserId(), query.projectId));
  } catch (error) {
    return fail(error);
  }
}
