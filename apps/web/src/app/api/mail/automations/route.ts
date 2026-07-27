import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailAutomationSchema } from "@/lib/schemas/mail-resource.schemas";
import { createAutomation } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createAutomation(
        await requireUserId(),
        await parseBody(request, createMailAutomationSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
