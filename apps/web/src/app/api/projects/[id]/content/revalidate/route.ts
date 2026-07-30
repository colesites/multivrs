import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { revalidateCacheSchema } from "@/lib/schemas/content-platform.schemas";
import { revalidateProjectCache } from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, revalidateCacheSchema);
    return ok(
      await revalidateProjectCache(
        await requireUserId(),
        (await params).id,
        input.tag,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
