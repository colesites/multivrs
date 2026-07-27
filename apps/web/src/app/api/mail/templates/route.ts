import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailTemplateSchema } from "@/lib/schemas/mail-resource.schemas";
import { createTemplate } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createTemplate(
        await requireUserId(),
        await parseBody(request, createMailTemplateSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
