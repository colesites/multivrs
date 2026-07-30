import {
  interpolatePath,
  matchPathPattern,
  type RuntimeProjectConfig,
} from "@multivrs/routing-utils";

export function applyBulkRedirects(
  request: Request,
  config: RuntimeProjectConfig,
): Response | null {
  const url = new URL(request.url);
  for (const redirect of config.bulkRedirects) {
    const match = matchPathPattern(redirect.source, url.pathname);
    if (!match.matched) continue;
    const destination = new URL(interpolatePath(redirect.destination, match.params), url);
    if (redirect.preserveQuery && !destination.search) destination.search = url.search;
    return Response.redirect(destination.toString(), redirect.statusCode);
  }
  return null;
}

export function resolveMicrofrontend(
  request: Request,
  config: RuntimeProjectConfig,
): { request: Request; targetProjectId: string } | null {
  const url = new URL(request.url);
  for (const route of config.microfrontends) {
    const match = matchPathPattern(route.source, url.pathname);
    if (!match.matched) continue;
    if (route.stripPrefix) url.pathname = match.remainder;
    const headers = new Headers(request.headers);
    const hop = Number(headers.get("x-multivrs-microfrontend-hop") ?? 0) + 1;
    headers.set("x-multivrs-microfrontend-hop", String(hop));
    return {
      request: new Request(url, {
        body: request.body,
        headers,
        method: request.method,
        redirect: request.redirect,
      }),
      targetProjectId: route.targetProjectId,
    };
  }
  return null;
}
