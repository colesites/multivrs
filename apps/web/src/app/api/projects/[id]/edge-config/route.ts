import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { setEdgeConfigEntrySchema } from "@/lib/schemas/content-platform.schemas";
import {
  listEdgeConfigEntries,
  setEdgeConfigEntry,
} from "@/lib/services/content-platform.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await listEdgeConfigEntries(await requireUserId(), (await params).id),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, setEdgeConfigEntrySchema);
    return ok(
      await setEdgeConfigEntry(await requireUserId(), (await params).id, input),
    );
  } catch (error) {
    return fail(error);
  }
}
