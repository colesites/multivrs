import { z } from "zod";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireSessionUserId } from "@/lib/api/session";
import {
  createApiToken,
  listApiTokens,
} from "@/lib/services/api-token.service";


const createTokenSchema = z.object({ name: z.string().trim().min(1).max(80) });

export async function GET() {
  try {
    return ok(await listApiTokens(await requireSessionUserId()));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const input = await parseBody(request, createTokenSchema);
    return ok(await createApiToken(userId, input.name), 201);
  } catch (error) {
    return fail(error);
  }
}
