import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailContactSchema } from "@/lib/schemas/mail-resource.schemas";
import { createContact } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createContact(
        await requireUserId(),
        await parseBody(request, createMailContactSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
