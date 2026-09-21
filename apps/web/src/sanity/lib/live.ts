import { cookies, draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import {
  defineLive,
  type LivePerspective,
  resolvePerspectiveFromCookies,
} from "next-sanity/live";
import { client } from "./client";

const token =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;
if (!token) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}

const { sanityFetch: liveSanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  // The browser token is exposed to browsers in draft/live preview.
  // It must be read-only and scoped to the minimum required permissions.
  browserToken: token,
  strict: true,
});

export { SanityLive };

/**
 * Executes a Sanity query.
 *
 * Inside Next.js `'use cache'` boundaries, delegates to `defineLive`'s fetcher
 * which applies Sanity Live tags and `cacheTag()`.
 *
 * Outside `'use cache'` boundaries (e.g. dynamic dashboard routes or
 * uncached Server Components), catches the `'cacheTag()' can only be called inside
 * a 'use cache' function` error and queries `client.fetch` directly without failing.
 */
export const sanityFetch: typeof liveSanityFetch = async function sanityFetch(
  options: Parameters<typeof liveSanityFetch>[0],
) {
  try {
    return await liveSanityFetch(options);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("cacheTag") ||
        error.message.includes("blocking-route") ||
        error.message.includes("connection()") ||
        error.message.includes("Suspense") ||
        error.message.includes("use cache"))
    ) {
      const resolvedParams = options.params ? await options.params : {};
      const result = await client.fetch(options.query, resolvedParams, {
        perspective: options.perspective,
        stega: options.stega,
        token:
          options.perspective !== "published" || options.stega
            ? token
            : undefined,
      });
      return {
        data: result,
        sourceMap: null,
        tags: [],
      };
    }
    throw error;
  }
} as typeof liveSanityFetch;

export interface DynamicFetchOptions {
  perspective: LivePerspective;
  stega: boolean;
}

export async function getDynamicFetchOptions(): Promise<DynamicFetchOptions> {
  const { isEnabled: isDraftMode } = await draftMode();
  if (!isDraftMode) {
    return { perspective: "published", stega: false };
  }

  const jar = await cookies();
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar });
  return { perspective: perspective ?? "drafts", stega: true };
}

// For usage within generateStaticParams
export async function sanityFetchStaticParams<
  const QueryString extends string,
>({ query, params = {} }: { query: QueryString; params?: QueryParams }) {
  "use cache";
  const { data } = await sanityFetch({
    query,
    params,
    perspective: "published",
    stega: false,
  });
  return { data };
}

// For usage within generateMetadata and generateViewport
export async function sanityFetchMetadata<const QueryString extends string>({
  query,
  params = {},
  perspective,
}: {
  query: QueryString;
  params?: QueryParams;
  perspective: LivePerspective;
}) {
  "use cache";
  const { data } = await sanityFetch({
    query,
    params,
    perspective,
    stega: false,
  });
  return { data };
}
