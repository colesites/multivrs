import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { prepareBlobUploadSchema } from "@/lib/schemas/content-platform.schemas";
import {
  listBlobs,
  prepareBlobUpload,
} from "@/lib/services/blob-storage.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(await listBlobs(await requireUserId(), (await params).id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, prepareBlobUploadSchema);
    return ok(
      await prepareBlobUpload(await requireUserId(), (await params).id, input),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
