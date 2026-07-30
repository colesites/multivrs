import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { completeBlobUpload } from "@/lib/services/blob-storage.service";

interface RouteParams {
  params: Promise<{ blobId: string; id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { blobId, id } = await params;
    return ok(await completeBlobUpload(await requireUserId(), id, blobId));
  } catch (error) {
    return fail(error);
  }
}
