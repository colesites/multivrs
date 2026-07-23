import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { sandboxDomainOrderSchema } from "@/lib/domains/domain-order.schemas";
import { OpenproviderApiError } from "@/lib/domains/openprovider-client";
import { orderSandboxDomain } from "@/lib/services/sandbox-domain-order.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, sandboxDomainOrderSchema);
    return ok(await orderSandboxDomain(userId, input), 201);
  } catch (error) {
    if (error instanceof OpenproviderApiError) {
      return NextResponse.json(
        {
          error: {
            code: "provider_error",
            message: error.message,
          },
        },
        { status: error.status },
      );
    }
    return fail(error);
  }
}
