import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import { revokeApiToken } from "@/lib/services/api-token.service";


export async function DELETE(
  _request: Request,
  context: { params: Promise<{ tokenId: string }> },
) {
  try {
    const userId = await requireSessionUserId();
    const { tokenId } = await context.params;
    await revokeApiToken(userId, tokenId);
    return ok({ revoked: true });
  } catch (error) {
    return fail(error);
  }
}
