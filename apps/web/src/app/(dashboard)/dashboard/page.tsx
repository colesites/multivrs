import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * `/dashboard` — a redirect resolver, not a rendered page (mirrors the root
 * route at `src/app/page.tsx`).
 *
 * The auth flows send users here as a username-agnostic landing target after
 * sign-in / sign-up; this page reads the real session and forwards them on:
 *   - Logged out          -> /login
 *   - Logged in, username  -> /<username>  (their dashboard)
 *   - Logged in, no
 *     username yet         -> /signup?step=username  (finish onboarding)
 *
 * Lives inside the (dashboard) group so it shares the dashboard layout's auth
 * gate. As a static segment it always wins over the sibling dynamic
 * `[username]` route, so there is no collision.
 */
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const username = session.user.username;
  redirect(username ? `/${username}` : "/signup?step=username");
}
