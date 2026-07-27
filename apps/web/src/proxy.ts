import { getSessionCookie } from "better-auth/cookies";
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
  "/emails",
  "/ci-cd",
  "/changelog",
  "/customers",
  "/build",
];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const hostname = req.headers.get("host")?.split(":")[0]?.toLowerCase();

  // Local deployment hostnames use wildcard localhost DNS. Keeping the
  // deployed application on its own origin means Next.js absolute `/_next/*`
  // assets, route handlers, cookies, and client navigation work exactly as
  // they do behind the production serve worker.
  if (hostname?.endsWith(".localhost")) {
    const deploymentId = hostname.slice(0, -".localhost".length);
    if (deploymentId) {
      const destination = req.nextUrl.clone();
      destination.pathname = `/api/deployments/${deploymentId}/serve${path}`;
      return NextResponse.rewrite(destination);
    }
  }

  // Always pass through Next.js internal static assets, images, and public files.
  // Never redirect _next assets or static files to authentication.
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico" ||
    path.endsWith(".svg") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".webp") ||
    path.endsWith(".woff2")
  ) {
    return NextResponse.next();
  }

  // Optimistic check: presence of the session cookie. This is NOT a real
  // auth check — the matching page/layout verifies the session server-side.
  const hasSession = Boolean(
    getSessionCookie(req, { cookiePrefix: "multivrs" }),
  );

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
  // Exclude static assets, Next.js internal bundles, and API routes from
  // protection redirects.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2)$).*)",
  ],
};
