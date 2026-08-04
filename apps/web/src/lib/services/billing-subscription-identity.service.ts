import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function validBillingUser(
  candidate?: string,
  existing?: string | null,
): Promise<string | null> {
  if (!candidate || !z.uuid().safeParse(candidate).success) {
    return existing ?? null;
  }
  const user = await prisma.user.findUnique({
    where: { id: candidate },
    select: { id: true },
  });
  return user?.id ?? existing ?? null;
}

export async function validBillingOrganization(
  candidate?: string,
  existing?: string | null,
): Promise<string | null> {
  if (!candidate || !z.uuid().safeParse(candidate).success) {
    return existing ?? null;
  }
  const organization = await prisma.organization.findUnique({
    where: { id: candidate },
    select: { id: true },
  });
  return organization?.id ?? existing ?? null;
}
