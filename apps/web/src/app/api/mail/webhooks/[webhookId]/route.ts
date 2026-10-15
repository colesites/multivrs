import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteWebhook } from "@/lib/services/mail-resource.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  try {
    const { webhookId } = await params;
    await deleteWebhook(await requireUserId(), webhookId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
