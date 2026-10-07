import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateMailboxSchema } from "@/lib/schemas/mail-resource.schemas";
import {
  deleteMailbox,
  updateMailbox,
} from "@/lib/services/mail-resource.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ mailboxId: string }> },
) {
  try {
    const input = await parseBody(request, updateMailboxSchema);
    const { mailboxId } = await params;
    return ok(await updateMailbox(await requireUserId(), mailboxId, input));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ mailboxId: string }> },
) {
  try {
    const { mailboxId } = await params;
    await deleteMailbox(await requireUserId(), mailboxId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
