import { type NextRequest, NextResponse } from "next/server";

/**
 * Public route prefixes that never require a session. Everything else
 * (notably the dashboard at /[username]) is treated as protected.
 *
 * Keep this in sync with the marketing routes under app/(marketing) and the
 * reserved usernames in src/lib/auth/plugins.ts.
 */
const publicPrefixes = [
  "/home",
  "/about",
  "/pricing",
  "/blog",
  "/help",
  "/security",
  "/observability",
  "/fluid",
  "/cdn",
  "/shipped",
  "/startups",
  "/legal",
  "/docs",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/contact",
  // Product pages linked from the header mega-menu.
  "/agent",
  "/plugin",
  "/domains",
  "/email",
  "/ci-cd",
  "/changelog",
  "/customers",
  "/build",
];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Optimistic check: presence of the session cookie. This is NOT a real
  // auth check — the matching page/layout verifies the session server-side.
  const sessionCookie = req.cookies.get("multivrs.session_token");
  const hasSession = !!sessionCookie?.value;

  const isPublic = publicPrefixes.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  // Root: send logged-out visitors to the marketing landing. Logged-in users
  // fall through to app/page.tsx, which redirects to their /<username>.
  if (path === "/") {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }

  // Anything that isn't an explicitly public route is protected (the
  // dashboard at /[username] and its sub-routes).
  if (!isPublic && !hasSession) {
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("from", path);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
