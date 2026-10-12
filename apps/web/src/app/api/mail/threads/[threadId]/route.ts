/** /api/mail/threads/:threadId — a conversation's messages, for the reader. */
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { mailThreadMessages } from "@/lib/services/mail-threads.service";

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

export async function GET(_request: Request, context: RouteParams) {
  try {
    const [viewerId, { threadId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    return ok(await mailThreadMessages(viewerId, threadId));
  } catch (error) {
    return fail(error);
  }
}
