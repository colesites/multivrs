import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createProjectSandbox } from "@/lib/services/sandbox.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await createProjectSandbox(await requireUserId(), (await params).id),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
