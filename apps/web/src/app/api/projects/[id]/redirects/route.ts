import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createBulkRedirectSchema } from "@/lib/schemas/content-platform.schemas";
import {
  createBulkRedirect,
  listBulkRedirects,
} from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await listBulkRedirects(await requireUserId(), (await params).id),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, createBulkRedirectSchema);
    return ok(
      await createBulkRedirect(await requireUserId(), (await params).id, input),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
