import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import { syncUserToConvex } from "@/lib/convex-sync";
import { prisma } from "@/lib/prisma";
import type {
  AccountProfile,
  AccountProfileInput,
} from "@/lib/schemas/account.schemas";
import { accountProfileResponseSchema } from "@/lib/schemas/account.schemas";
import { recordAuditEvent } from "@/lib/services/audit-event.service";

export async function getAccountProfile(
  userId: string,
): Promise<AccountProfile> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.username) throw new NotFoundError("Account not found");
  return accountProfileResponseSchema.parse({
    email: user.email,
    image: user.image,
    name: user.name,
    username: user.username,
  });
}

export async function updateAccountProfile(
  userId: string,
  input: AccountProfileInput,
): Promise<AccountProfile> {
  const collision = await prisma.user.findFirst({
    select: { id: true },
    where: { id: { not: userId }, username: input.username },
  });
  if (collision) throw new ConflictError("That username is already in use");
  const user = await prisma.user.update({
    data: { image: input.image, name: input.name, username: input.username },
    where: { id: userId },
  });
  return profileChanged(user);
}

/** Sets or clears the account's avatar URL. */
export async function setAccountImage(
  userId: string,
  image: string | null,
): Promise<AccountProfile> {
  const user = await prisma.user.update({
    data: { image },
    where: { id: userId },
  });
  return profileChanged(user);
}

async function profileChanged(user: {
  email: string;
  id: string;
  image: string | null;
  name: string;
  username: string | null;
}): Promise<AccountProfile> {
  await recordAuditEvent({
    action: "account.profile.updated",
    entityId: user.id,
    entityType: "user",
    userId: user.id,
  });
  try {
    await syncUserToConvex({
      authId: user.id,
      email: user.email,
      image: user.image ?? undefined,
      name: user.name,
    });
  } catch {
    // Neon remains authoritative; the existing sync retry handles transient Convex failures.
  }
  return accountProfileResponseSchema.parse({
    email: user.email,
    image: user.image,
    name: user.name,
    username: user.username,
  });
}
