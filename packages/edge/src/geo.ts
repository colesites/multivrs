/**
 * Geolocation helpers. On Cloudflare the edge sets `cf-ipcountry` and
 * `cf-connecting-ip`; we read those (with an `x-forwarded-for` fallback for the
 * client IP) so middleware can personalize by location.
 */
export interface Geo {
  ip?: string;
  country?: string;
}

/** Minimal `Headers`-like; the standard `Headers` object satisfies it. */
export interface HeaderLookup {
  get(name: string): string | null;
}

export function getGeo(headers: HeaderLookup): Geo {
  const country = headers.get("cf-ipcountry") ?? undefined;
  const forwardedFor = headers.get("x-forwarded-for");
  const ip = headers.get("cf-connecting-ip") ?? forwardedFor?.split(",")[0]?.trim() ?? undefined;
  return { ip, country };
}
