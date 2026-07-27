import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteMailDomain } from "@/lib/services/mail-domain.service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ domainId: string }> },
) {
  try {
    const { domainId } = await params;
    await deleteMailDomain(await requireUserId(), domainId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
