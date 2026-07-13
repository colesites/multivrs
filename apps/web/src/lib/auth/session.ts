import type { headers } from "next/headers";
import { auth } from "@/lib/auth";

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

export type ServerSession = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function getServerSession(
  requestHeaders: RequestHeaders,
): Promise<ServerSession> {
  try {
    return await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.warn("Failed to read auth session", error);
    return null;
  }
}
