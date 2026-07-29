import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import { accountProfileSchema } from "@/lib/schemas/account.schemas";
import {
  getAccountProfile,
  updateAccountProfile,
} from "@/lib/services/account.service";


export async function GET() {
  try {
    return ok(await getAccountProfile(await requireSessionUserId()));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const input = await parseBody(request, accountProfileSchema);
    return ok(await updateAccountProfile(userId, input));
  } catch (error) {
    return fail(error);
  }
}
