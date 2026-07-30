import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createLogDrainSchema } from "@/lib/schemas/log-drain.schemas";
import {
  createLogDrain,
  listLogDrains,
} from "@/lib/services/log-drain.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(await listLogDrains(await requireUserId(), (await params).id));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await createLogDrain(
        await requireUserId(),
        (await params).id,
        await parseBody(request, createLogDrainSchema),
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
