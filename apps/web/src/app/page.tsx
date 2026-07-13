import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

/**
 * Root route ("/").
 *
 * This page never renders UI — it only decides where to send the visitor,
 * mirroring how vercel.com works:
 *   - Logged out      -> /home   (marketing landing)
 *   - Logged in       -> /<username>  (their dashboard, e.g. /c-tech)
 *   - Logged in, but
 *     no username yet -> /signup?step=username  (finish onboarding)
 *
 * The Proxy (proxy.ts) does a fast, optimistic cookie check for the same
 * redirect so logged-out users never even reach this server component. This
 * page is the authoritative fallback that actually reads the session.
 */
export default async function RootPage() {
  const session = await getServerSession(await headers());

  if (!session) {
    redirect("/home");
  }

  const username = session.user.username;
  if (!username) {
    // Authenticated but hasn't picked a username — send them to finish setup.
    redirect("/signup?step=username");
  }

  redirect(`/${username}`);
}
