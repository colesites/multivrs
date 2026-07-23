const DEFAULT_AUTH_RETURN_PATH = "/dashboard";
const INTERNAL_ORIGIN = "https://multivrs.local";

export function normalizeAuthReturnPath(
  value?: string,
  fallback = DEFAULT_AUTH_RETURN_PATH,
): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function buildSignInHref(returnPath: string): string {
  const params = new URLSearchParams({
    from: normalizeAuthReturnPath(returnPath),
  });
  return `/login?${params.toString()}`;
}
