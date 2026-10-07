import "server-only";
import { prisma } from "@/lib/prisma";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";

const PAID_ROLES = ["owner", "admin", "developer"];

/** Owners, admins and developers take a developer seat; viewers and billing don't. */
export function isPaidRole(role: string): boolean {
  return role.split(",").some((r) => PAID_ROLES.includes(r.trim()));
}

export async function assertOrganizationSeat(
  userId: string,
  organizationId: string,
  role: string,
): Promise<void> {
  if (!isPaidRole(role)) return;
  const [workspace, members, invitations] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { accountOwnerId: true },
    }),
    prisma.member.count({
      where: { organizationId, role: { in: PAID_ROLES } },
    }),
    prisma.invitation.count({
      where: {
        organizationId,
        role: { in: PAID_ROLES },
        status: "pending",
      },
    }),
  ]);
  // An account's team uses the account's own plan, whoever sends the invite.
  await assertResourceAvailable({
    current: members + invitations,
    ...(workspace?.accountOwnerId
      ? { userId: workspace.accountOwnerId }
      : { organizationId, userId }),
    resource: "developer_seats",
  });
}

export async function activeDeveloperSeats(
  organizationId: string,
): Promise<number> {
  return prisma.member.count({
    where: { organizationId, role: { in: PAID_ROLES } },
  });
}
