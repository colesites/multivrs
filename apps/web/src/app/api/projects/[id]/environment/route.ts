import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { saveEnvironmentVariableSchema } from "@/lib/schemas/environment-variable.schemas";
import {
  listEnvironmentVariables,
  saveEnvironmentVariable,
} from "@/lib/services/environment-variable.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    return ok(
      await listEnvironmentVariables(await requireUserId(), (await params).id),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, saveEnvironmentVariableSchema);
    return ok(
      await saveEnvironmentVariable(
        await requireUserId(),
        (await params).id,
        input,
      ),
      201,
    );
  } catch (error) {
    return fail(error);
  }
}
