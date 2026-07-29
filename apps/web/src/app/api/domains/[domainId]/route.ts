import { ValidationError } from "@multivrs/error-utils";
import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import { updateDomainSchema } from "@/lib/domains/dns.schemas";
import {
  assignDomainProject,
  removeDomain,
  updateDomainAutoRenew,
} from "@/lib/services/domain-management.service";


interface RouteParams {
  params: Promise<{ domainId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const [userId, { domainId }, input] = await Promise.all([
      requireUserId(),
      context.params,
      parseBody(request, updateDomainSchema),
    ]);
    if (input.autoRenew !== undefined) {
      return ok(await updateDomainAutoRenew(userId, domainId, input.autoRenew));
    }
    if (!input.projectId) throw new ValidationError("Project is required");
    return ok(
      await assignDomainProject(userId, domainId, {
        projectId: input.projectId,
      }),
    );
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const [userId, { domainId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    await removeDomain(userId, domainId);
    return ok({ success: true });
  } catch (error) {
    return fail(error);
  }
}
