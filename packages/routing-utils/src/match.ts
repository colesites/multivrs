/**
 * Match a request against an ordered route list. Rules apply in order: a
 * redirect (3xx with a dest) terminates immediately; a rewrite updates the
 * working pathname; `continue: true` keeps matching (header rules), otherwise
 * the first match is terminal.
 */
import type { Route } from "./schema";

export interface MatchInput {
  pathname: string;
  method?: string;
}

export interface MatchResult {
  matched: boolean;
  /** Possibly rewritten pathname. */
  pathname: string;
  status?: number;
  headers: Record<string, string>;
  isRedirect: boolean;
  redirectLocation?: string;
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function applyBackrefs(dest: string, match: RegExpMatchArray): string {
  return dest.replace(/\$(\d+)/g, (_, n: string) => match[Number(n)] ?? "");
}

export function matchRoutes(routes: Route[], input: MatchInput): MatchResult {
  const method = input.method?.toUpperCase();
  const result: MatchResult = {
    matched: false,
    pathname: input.pathname,
    headers: {},
    isRedirect: false,
  };

  for (const route of routes) {
    if (route.methods && method) {
      const allowed = route.methods.map((m) => m.toUpperCase());
      if (!allowed.includes(method)) {
        continue;
      }
    }

    const re = new RegExp(`^${route.src}$`);
    const match = result.pathname.match(re);
    if (!match) {
      continue;
    }

    result.matched = true;
    if (route.headers) {
      Object.assign(result.headers, route.headers);
    }
    if (route.status !== undefined) {
      result.status = route.status;
    }

    if (route.dest !== undefined) {
      const dest = applyBackrefs(route.dest, match);
      if (route.status !== undefined && REDIRECT_STATUSES.has(route.status)) {
        result.isRedirect = true;
        result.redirectLocation = dest;
        return result;
      }
      result.pathname = dest;
    }

    if (!route.continue) {
      return result;
    }
  }

  return result;
}
