/**
 * /api/mail/threads — one page of a thread list, newest first.
 *   GET ?view=inbox&cursor=…&q=…&projectId=… | &account=username
 */
import { z } from "zod";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { mailAccount } from "@/lib/services/mail-access.service";
import { listMailThreads } from "@/lib/services/mail-threads.service";

const querySchema = z.object({
  view: z.enum([
    "inbox",
    "sent",
    "drafts",
    "archive",
    "spam",
    "trash",
    "starred",
    "recent",
  ]),
  cursor: z.string().max(200).optional(),
  q: z.string().trim().max(200).optional(),
  projectId: z.uuid().optional(),
  account: z.string().trim().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const query = querySchema.parse({
      view: params.get("view") ?? "inbox",
      cursor: params.get("cursor") || undefined,
      q: params.get("q") || undefined,
      projectId: params.get("projectId") || undefined,
      account: params.get("account") || undefined,
    });
    const viewerId = await requireUserId();
    const { ownerId } = await mailAccount(viewerId, query, "read");
    return ok(
      await listMailThreads(
        { ownerId, viewerId, projectId: query.projectId },
        { view: query.view, cursor: query.cursor, query: query.q },
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
