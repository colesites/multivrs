import { isMultivrsError } from "@multivrs/error-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { domainSearchResultSchema } from "@/features/domains/domain-commerce.schemas";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  listSavedDomains,
  removeSavedDomain,
  saveDomain,
} from "@/lib/services/saved-domain.service";

const removeSavedDomainSchema = z.object({
  hostname: z.string().trim().toLowerCase().min(3).max(253),
});

export async function GET() {
  try {
    return ok({ domains: await listSavedDomains(await requireUserId()) });
  } catch (error) {
    return savedDomainFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, domainSearchResultSchema);
    if (!input.available) {
      return ok({ saved: false, reason: "Domain is unavailable" }, 409);
    }
    await saveDomain(userId, input);
    return ok({ saved: true }, 201);
  } catch (error) {
    return savedDomainFailure(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = await parseBody(request, removeSavedDomainSchema);
    await removeSavedDomain(userId, input.hostname);
    return ok({ removed: true });
  } catch (error) {
    return savedDomainFailure(error);
  }
}

function savedDomainFailure(error: unknown) {
  if (isMultivrsError(error)) return fail(error);
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    return NextResponse.json(
      { error: { code: "saved_domain_error", message: error.message } },
      { status: 500 },
    );
  }
  return fail(error);
}
