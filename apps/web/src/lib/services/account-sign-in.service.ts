import "server-only";
import { getAuthenticatorName } from "@better-auth/passkey";
import type { headers } from "next/headers";
import type {
  AccountSignIn,
  SocialProvider,
} from "@/features/dashboard/types/account-security.types";
import { auth } from "@/lib/auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/services/logger.service";

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

const SOCIAL_PROVIDERS: SocialProvider[] = ["github", "google"];

function isSocialProvider(value: string): value is SocialProvider {
  return SOCIAL_PROVIDERS.some((provider) => provider === value);
}

/** How the signed-in user can sign in, and where they're signed in now. */
export async function getAccountSignIn(
  requestHeaders: RequestHeaders,
  current: { userId: string; sessionId: string },
): Promise<AccountSignIn> {
  const [sessions, accounts, passkeys] = await Promise.all([
    // Read directly: Better Auth's list-sessions endpoint demands a sign-in
    // from the last day, which would break Settings for everyone else.
    prisma.session.findMany({
      where: { userId: current.userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        token: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    auth.api.listUserAccounts({ headers: requestHeaders }),
    // Settings still load if passkeys can't (e.g. before their migration).
    auth.api.listPasskeys({ headers: requestHeaders }).catch((error) => {
      logError("auth.passkeys.list_failed", error);
      return null;
    }),
  ]);
  const providers = accounts.map((account) => account.providerId);
  return {
    hasPassword: providers.includes("credential"),
    connected: providers.filter(isSocialProvider),
    passkeys:
      passkeys?.map((passkey) => ({
        id: passkey.id,
        name: passkey.name ?? null,
        provider: getAuthenticatorName(passkey.aaguid) ?? null,
        createdAt: passkey.createdAt
          ? new Date(passkey.createdAt).toISOString()
          : null,
      })) ?? null,
    available: SOCIAL_PROVIDERS.filter(
      (provider) => authConfig.socialProviders[provider].enabled,
    ),
    sessions: sessions
      .map((session) => ({
        id: session.id,
        token: session.token,
        userAgent: session.userAgent ?? null,
        ipAddress: session.ipAddress ?? null,
        createdAt: session.createdAt.toISOString(),
        lastActiveAt: session.updatedAt.toISOString(),
        current: session.id === current.sessionId,
      }))
      .sort(
        (a, b) =>
          Number(b.current) - Number(a.current) ||
          b.lastActiveAt.localeCompare(a.lastActiveAt),
      ),
  };
}
