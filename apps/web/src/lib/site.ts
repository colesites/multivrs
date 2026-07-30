/**
 * Canonical site URL + derived values, sourced from the environment.
 *
 *   - local: http://localhost:3000
 *   - prod fallback: https://multivrs.space
 *
 * Set via `NEXT_PUBLIC_APP_URL` (public so client components — e.g. the
 * workspace-slug preview — can read the host too). Trailing slash is stripped
 * so callers can safely append paths.
 */
const DEFAULT_SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://multivrs.space"
    : "http://localhost:3000";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");

export const SITE_NAME = "MULTIVRS";
