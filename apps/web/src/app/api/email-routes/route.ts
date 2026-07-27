import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { createEmailRouteSchema } from "@/lib/schemas/email-route.schemas";
import {
  createEmailRoute,
  listEmailRoutes,
} from "@/lib/services/email-route.service";

export async function GET(request: NextRequest) {
  try {
    const projectId =
      request.nextUrl.searchParams.get("projectId") ?? undefined;
    return ok(await listEmailRoutes(await requireUserId(), projectId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = await parseBody(request, createEmailRouteSchema);
    return ok(await createEmailRoute(await requireUserId(), input), 201);
  } catch (error) {
    return fail(error);
  }
}
