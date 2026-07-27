import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailBroadcastSchema } from "@/lib/schemas/mail-resource.schemas";
import { createBroadcast } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    return ok(
      await createBroadcast(
        await requireUserId(),
        await parseBody(request, createMailBroadcastSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
