import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import { notificationMutationSchema } from "@/lib/schemas/notification.schemas";
import {
  listNotifications,
  mutateNotification,
} from "@/lib/services/notification.service";


export async function GET() {
  try {
    return ok(await listNotifications(await requireSessionUserId()));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const input = await parseBody(request, notificationMutationSchema);
    await mutateNotification(userId, input);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}
