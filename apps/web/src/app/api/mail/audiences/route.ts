import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailAudienceSchema } from "@/lib/schemas/mail-resource.schemas";
import { createAudience } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createAudience(
        await requireUserId(),
        await parseBody(request, createMailAudienceSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
