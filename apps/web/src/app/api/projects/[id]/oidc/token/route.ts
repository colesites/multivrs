import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { oidcTokenRequestSchema } from "@/lib/schemas/oidc.schemas";
import { issueProjectOidcToken } from "@/lib/services/oidc.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const input = await parseBody(request, oidcTokenRequestSchema);
    return ok(
      await issueProjectOidcToken(
        await requireUserId(),
        (await params).id,
        input.audience,
      ),
    );
  } catch (error) {
    return fail(error);
  }
}
