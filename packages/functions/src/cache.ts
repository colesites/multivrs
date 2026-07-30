export interface MultivrsCacheOptions {
  /** Seconds that a generated response remains fresh at the edge. */
  revalidate: number;
  /** Additional seconds that a stale response may be served while it regenerates. */
  staleWhileRevalidate?: number;
  /** Tags that can be invalidated independently through the Multivrs API. */
  tags?: string[];
}

function seconds(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative number of seconds`);
  }
  return Math.floor(value);
}

function cacheTags(tags: string[] | undefined): string[] {
  if (!tags) return [];
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 32);
}

/**
 * Build the response headers understood by Multivrs ISR and SWR.
 *
 * @example
 * return Response.json(data, {
 *   headers: multivrsCache({ revalidate: 60, staleWhileRevalidate: 300, tags: ["posts"] }),
 * });
 */
export function multivrsCache(options: MultivrsCacheOptions): Headers {
  const fresh = seconds(options.revalidate, "revalidate");
  const stale = seconds(options.staleWhileRevalidate ?? fresh, "staleWhileRevalidate");
  const headers = new Headers({
    "cache-control": `public, s-maxage=${fresh}, stale-while-revalidate=${stale}`,
    "x-multivrs-revalidate": String(fresh),
  });
  const tags = cacheTags(options.tags);
  if (tags.length > 0) headers.set("x-multivrs-cache-tags", tags.join(","));
  return headers;
}

/** Apply Multivrs ISR/SWR policy to an existing response without consuming its body. */
export function withMultivrsCache(response: Response, options: MultivrsCacheOptions): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of multivrsCache(options)) headers.set(name, value);
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
