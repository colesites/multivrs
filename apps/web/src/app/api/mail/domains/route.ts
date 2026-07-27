import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailDomainSchema } from "@/lib/schemas/mail-resource.schemas";
import { createMailDomain } from "@/lib/services/mail-domain.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createMailDomain(
        await requireUserId(),
        await parseBody(request, createMailDomainSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
