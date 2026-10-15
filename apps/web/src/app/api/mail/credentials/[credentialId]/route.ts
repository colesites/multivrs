import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteCredential } from "@/lib/services/mail-resource.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ credentialId: string }> },
) {
  try {
    const { credentialId } = await params;
    await deleteCredential(await requireUserId(), credentialId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
