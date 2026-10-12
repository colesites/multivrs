/**
 * /api/domains/search — domain availability, streamed as newline-delimited
 * JSON (`DomainSearchEvent` per line) so results show as each batch returns.
 *   ?q=name            the name to search
 *   &offset=0&limit=60 which page of ranked extensions to check
 *   &tld=dev           check only this extension
 */
import {
  DOMAIN_SEARCH_PAGE_SIZE,
  type DomainSearchEvent,
  normalizeDomainQuery,
} from "@/features/domains/domain-marketplace";
import {
  type DomainSearchPage,
  streamDomainSearch,
} from "@/lib/domains/domain-search-stream";
import { openproviderSearcher } from "@/lib/domains/openprovider";
import { logError } from "@/lib/services/logger.service";

const MAX_PAGE_SIZE = 120;

export function GET(request: Request) {
  const url = new URL(request.url);
  const page: DomainSearchPage = {
    name: normalizeDomainQuery(url.searchParams.get("q") ?? ""),
    offset: integer(url.searchParams.get("offset"), 0, 0, 10_000),
    limit: integer(
      url.searchParams.get("limit"),
      DOMAIN_SEARCH_PAGE_SIZE,
      1,
      MAX_PAGE_SIZE,
    ),
    tld:
      url.searchParams
        .get("tld")
        ?.toLowerCase()
        .replace(/[^a-z0-9-]/g, "") || undefined,
  };
  return new Response(toNdjson(searchEvents(page, request.signal)), {
    headers: {
      "cache-control": "no-store",
      "content-type": "application/x-ndjson; charset=utf-8",
      "x-accel-buffering": "no",
      "x-content-type-options": "nosniff",
    },
  });
}

async function* searchEvents(
  page: DomainSearchPage,
  signal: AbortSignal,
): AsyncGenerator<DomainSearchEvent> {
  if (page.name.length < 2) {
    yield { type: "done", nextOffset: null };
    return;
  }
  try {
    const searcher = await openproviderSearcher();
    if (!searcher) {
      yield {
        type: "error",
        code: "not_configured",
        message: "Domain search is not configured.",
      };
      return;
    }
    yield* streamDomainSearch(searcher, page, signal, (error) =>
      logError("domains.search.batch_failed", error),
    );
  } catch (error) {
    if (signal.aborted) return;
    logError("domains.search.provider_failed", error);
    yield {
      type: "error",
      code: "unavailable",
      message: "Domain search is temporarily unavailable.",
    };
  }
}

function toNdjson(events: AsyncGenerator<DomainSearchEvent>) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { value, done } = await events.next();
      if (done) controller.close();
      else controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
    },
    // The browser left (new search, closed tab): stop checking.
    async cancel() {
      await events.return(undefined);
    },
  });
}

function integer(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? fallback : Math.min(max, Math.max(min, parsed));
}
