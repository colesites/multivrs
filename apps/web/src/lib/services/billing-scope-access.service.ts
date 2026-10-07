import "server-only";
import { ForbiddenError, NotFoundError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export type BillingScopeAccess = {
  canManage: boolean;
  name: string;
  organizationId: string | null;
  scopeId: string;
  userId: string;
};

export async function requireBillingScope(
  userId: string,
  scopeId: string,
  manage = false,
): Promise<BillingScopeAccess> {
  if (scopeId === "personal") {
    return {
      canManage: true,
      name: "Personal account",
      organizationId: null,
      scopeId,
      userId,
    };
  }
  const organization = await prisma.organization.findUnique({
    where: { id: scopeId },
    select: {
      id: true,
      name: true,
      accountOwnerId: true,
      members: {
        where: { userId },
        select: { role: true },
        take: 1,
      },
    },
  });
  const role = organization?.members[0]?.role;
  // An account's team bills to the account's personal plan.
  if (!organization || !role || organization.accountOwnerId)
    throw new NotFoundError("Billing workspace not found");
  const canManage = role === "owner" || role === "billing";
  if (manage && !canManage) {
    throw new ForbiddenError(
      "Only workspace owners and billing members can manage billing",
    );
  }
  return {
    canManage,
    name: organization.name,
    organizationId: organization.id,
    scopeId: organization.id,
    userId,
  };
}

export function subscriptionScopeWhere(access: BillingScopeAccess) {
  return access.organizationId
    ? { organizationId: access.organizationId }
    : { organizationId: null, userId: access.userId };
}
