/**
 * API auth guard. Unlike the page DAL (which redirects), this throws an
 * `UnauthorizedError` so route handlers turn it into a 401 JSON response.
 */
import "server-only";
import { UnauthorizedError } from "@multivrs/error-utils";
import { headers } from "next/headers";
import { hashApiToken, isApiToken } from "@/lib/api/api-token";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireSessionUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new UnauthorizedError();
  return session.user.id;
}

export async function requireUserId(): Promise<string> {
  const requestHeaders = await headers();
  const authorization = requestHeaders.get("authorization");
  const apiToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  if (apiToken && isApiToken(apiToken)) {
    const token = await prisma.apiToken.findUnique({
      where: { tokenHash: hashApiToken(apiToken) },
    });
    if (token && (!token.expiresAt || token.expiresAt > new Date())) {
      await prisma.apiToken.update({
        where: { id: token.id },
        data: { lastUsedAt: new Date() },
      });
      return token.userId;
    }
  }

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}
