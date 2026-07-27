import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createMailboxSchema } from "@/lib/schemas/mail-resource.schemas";
import { createMailbox } from "@/lib/services/mail-resource.service";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, createMailboxSchema);
    return ok(await createMailbox(await requireUserId(), input), 201);
  } catch (error) {
    return fail(error);
  }
}
