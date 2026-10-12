/**
 * /api/mail/logs — one page of the email log, newest first.
 *   GET ?cursor=…&projectId=… | &account=username
 */
import { z } from "zod";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { mailAccount } from "@/lib/services/mail-access.service";
import { listMailLog } from "@/lib/services/mail-threads.service";

const querySchema = z.object({
  cursor: z.string().max(200).optional(),
  projectId: z.uuid().optional(),
  account: z.string().trim().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const query = querySchema.parse({
      cursor: params.get("cursor") || undefined,
      projectId: params.get("projectId") || undefined,
      account: params.get("account") || undefined,
    });
    const viewerId = await requireUserId();
    const { ownerId } = await mailAccount(viewerId, query, "read");
    return ok(
      await listMailLog(
        { ownerId, viewerId, projectId: query.projectId },
        query.cursor,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
