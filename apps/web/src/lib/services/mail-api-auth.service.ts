import "server-only";
import { createHash } from "node:crypto";
import { UnauthorizedError } from "@multivrs/error-utils";
import { prisma } from "@/lib/prisma";

export async function authenticateMailCredential(
  request: Request,
  kind: "api" | "smtp",
) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!token.startsWith("mlv_") || token.length < 40)
    throw new UnauthorizedError();
  const secretHash = createHash("sha256").update(token).digest("hex");
  const credential = await prisma.mailCredential.findUnique({
    where: { secretHash },
  });
  if (!credential) throw new UnauthorizedError();
  if (
    credential.kind !== kind ||
    credential.revokedAt ||
    (credential.expiresAt && credential.expiresAt <= new Date()) ||
    !credential.permissions.includes("mail.send")
  ) {
    throw new UnauthorizedError();
  }
  await prisma.mailCredential.update({
    where: { id: credential.id },
    data: { lastUsedAt: new Date() },
  });
  return credential;
}

export function authenticateMailApi(request: Request) {
  return authenticateMailCredential(request, "api");
}
