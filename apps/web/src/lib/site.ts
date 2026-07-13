/**
 * Canonical site URL + derived values, sourced from the environment.
 *
 *   - local: http://localhost:3000
 *   - prod:  https://multivrs.vercel.app
 *
 * Set via `NEXT_PUBLIC_APP_URL` (public so client components — e.g. the
 * workspace-slug preview — can read the host too). Trailing slash is stripped
 * so callers can safely append paths.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).replace(/\/$/, "");

/** Host only, e.g. "multivrs.vercel.app" or "localhost:3000". */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export const SITE_NAME = "MULTIVRS";
