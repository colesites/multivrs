import "server-only";
import { prisma } from "@/lib/prisma";
import { assertResourceAvailable } from "@/lib/services/billing-entitlement.service";

const PAID_ROLES = ["owner", "admin", "developer"];

export async function assertOrganizationSeat(
  userId: string,
  organizationId: string,
  role: string,
): Promise<void> {
  if (!PAID_ROLES.includes(role)) return;
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
