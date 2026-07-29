import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { logWarning } from "@/lib/services/logger.service";

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Reads a Better Auth session. Omitting headers uses the current request.
 * React cache deduplicates identical calls across nested layouts and pages.
 */
export const getServerSession = cache(
  async (requestHeaders?: RequestHeaders): Promise<ServerSession> => {
    const sessionHeaders = requestHeaders ?? (await headers());

    try {
      return await auth.api.getSession({ headers: sessionHeaders });
    } catch (error) {
      logWarning("auth.session.read_failed", error);
      return null;
    }
  },
);
