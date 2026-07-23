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
import { connectDomain } from "@/lib/services/domain-management.service";

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
  const [project, existing, user] = await Promise.all([
    prisma.project.findFirst({
      where: { id: input.projectId, ownerId: userId },
      select: { id: true },
    }),
    prisma.domain.findUnique({
      where: { hostname: input.hostname },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    }),
  ]);
  if (!project || !user) throw new NotFoundError("Project not found");
  if (existing) throw new ConflictError("This domain is already connected");
  const customerHandle = isLocalOpenproviderSandbox()
    ? "LOCAL-SANDBOX"
    : await getSandboxCustomerHandle(user);
  const registration = await registerSandboxDomain(
    input.hostname,
    customerHandle,
  );
  const domain = await connectDomain(userId, input);
  return {
    domainId: domain.id,
    hostname: domain.hostname,
    providerDomainId: registration.providerDomainId,
    status: registration.status,
  };
}
