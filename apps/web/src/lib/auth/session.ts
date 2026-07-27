import type { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { logWarning } from "@/lib/services/logger.service";

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function getServerSession(
  requestHeaders: RequestHeaders,
): Promise<ServerSession> {
  try {
    return await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    logWarning("auth.session.read_failed", error);
    return null;
  }
}
