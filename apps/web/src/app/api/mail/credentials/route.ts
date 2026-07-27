import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailCredentialSchema } from "@/lib/schemas/mail-resource.schemas";
import { createCredential } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createCredential(
        await requireUserId(),
        await parseBody(request, createMailCredentialSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
