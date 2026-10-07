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
  const [members, invitations] = await Promise.all([
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
  await assertResourceAvailable({
    current: members + invitations,
    organizationId,
    resource: "developer_seats",
    userId,
  });
}

export async function activeDeveloperSeats(
  organizationId: string,
): Promise<number> {
  return prisma.member.count({
    where: { organizationId, role: { in: PAID_ROLES } },
  });
}
