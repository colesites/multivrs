import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";

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
export default async function DashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [session, searchParams] = await Promise.all([
    getServerSession(),
    props.searchParams,
  ]);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") {
      query.set(key, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
    }
  }
  const qs = query.toString();

  if (!session) {
    const nextUrl = `/dashboard${qs ? `?${qs}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }

  const username = session.user.username;
  redirect(
    username
      ? `/${username}${qs ? `?${qs}` : ""}`
      : `/signup?step=username${qs ? `&${qs}` : ""}`,
  );
}
