import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { verifyMailDomain } from "@/lib/services/mail-domain.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ domainId: string }> },
) {
  try {
    return ok(
      await verifyMailDomain(await requireUserId(), (await params).domainId),
    );
  } catch (error) {
    return fail(error);
  }
}
