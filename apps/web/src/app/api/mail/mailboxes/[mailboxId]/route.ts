import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteMailbox } from "@/lib/services/mail-resource.service";

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
