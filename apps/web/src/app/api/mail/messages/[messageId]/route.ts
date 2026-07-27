import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { mailMessageActionSchema } from "@/lib/schemas/mail-message.schemas";
import { updateMailMessage } from "@/lib/services/mail-message.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> },
) {
  try {
    const input = await parseBody(request, mailMessageActionSchema);
    return ok(
      await updateMailMessage(
        await requireUserId(),
        (await params).messageId,
        input.action,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
