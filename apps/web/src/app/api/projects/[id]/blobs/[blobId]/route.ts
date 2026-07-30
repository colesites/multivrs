import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { deleteBlob, getBlobAccess } from "@/lib/services/blob-storage.service";

interface RouteParams {
  params: Promise<{ blobId: string; id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { blobId, id } = await params;
    return ok(await getBlobAccess(await requireUserId(), id, blobId));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { blobId, id } = await params;
    await deleteBlob(await requireUserId(), id, blobId);
    return ok({ deleted: true });
  } catch (error) {
    return fail(error);
  }
}
