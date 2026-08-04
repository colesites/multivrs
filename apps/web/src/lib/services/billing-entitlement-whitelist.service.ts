import "server-only";
import { prisma } from "@/lib/prisma";

type BillingScope = {
  organizationId: string | null;
  ownerId: string;
};

export async function isBillingScopeWhitelisted(
  scope: BillingScope,
): Promise<boolean> {
  const emails = scope.organizationId
    ? await organizationOwnerEmails(scope.organizationId)
    : await personalOwnerEmails(scope.ownerId);

  if (emails.length === 0) return false;

  const entry = await prisma.billingEntitlementWhitelist.findFirst({
    where: {
      email: { in: emails.map(normalizeEmail) },
      enabled: true,
    },
    select: { email: true },
  });
  return entry !== null;
}

async function personalOwnerEmails(ownerId: string): Promise<string[]> {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { email: true },
  });
  return owner ? [owner.email] : [];
}

async function organizationOwnerEmails(
  organizationId: string,
): Promise<string[]> {
  const owners = await prisma.member.findMany({
    where: { organizationId, role: "owner" },
    select: { user: { select: { email: true } } },
  });
  return owners.map((owner) => owner.user.email);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
