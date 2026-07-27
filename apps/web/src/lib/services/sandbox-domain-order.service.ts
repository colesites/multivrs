import "server-only";
import { ConflictError, NotFoundError } from "@multivrs/error-utils";
import type { SandboxDomainOrderInput } from "@/lib/domains/domain-order.schemas";
import {
  isLocalOpenproviderSandbox,
  isOpenproviderSandbox,
  OpenproviderApiError,
} from "@/lib/domains/openprovider-client";
import { getSandboxCustomerHandle } from "@/lib/domains/openprovider-customer";
import { registerSandboxDomain } from "@/lib/domains/openprovider-register";
import { prisma } from "@/lib/prisma";

export interface SandboxDomainOrderResult {
  domainId: string;
  hostname: string;
  providerDomainId: number | null;
  status: string;
}

export async function orderSandboxDomain(
  userId: string,
  input: SandboxDomainOrderInput,
): Promise<SandboxDomainOrderResult> {
  if (!isOpenproviderSandbox()) {
    throw new OpenproviderApiError(
      "Sandbox checkout is disabled outside the sandbox",
      403,
    );
  }
  const [existing, user] = await Promise.all([
    prisma.domain.findUnique({
      where: { hostname: input.hostname },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
  ]);
  if (!user) throw new NotFoundError("Account not found");
  if (existing) throw new ConflictError("This domain is already connected");
  const customerHandle = isLocalOpenproviderSandbox()
    ? "LOCAL-SANDBOX"
    : await getSandboxCustomerHandle(user);
  const registration = await registerSandboxDomain(
    input.hostname,
    customerHandle,
  );
  const domain = await prisma.domain.create({
    data: {
      userId,
      hostname: input.hostname,
      projectId: null,
      managed: true,
      autoRenew: true,
      expiresAt: oneYearFromNow(),
      providerDomainId: registration.providerDomainId?.toString() ?? null,
    },
    select: { id: true, hostname: true },
  });
  return {
    domainId: domain.id,
    hostname: domain.hostname,
    providerDomainId: registration.providerDomainId,
    status: registration.status,
  };
}

function oneYearFromNow(): Date {
  const expiresAt = new Date();
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  return expiresAt;
}
