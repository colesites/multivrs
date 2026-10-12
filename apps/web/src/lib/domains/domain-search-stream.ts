import type {
  DomainSearchEvent,
  DomainSearchResult,
} from "@/features/domains/domain-marketplace";
import { relevantDomainExtensions } from "@/features/domains/domain-marketplace";

/** Extensions checked per provider request. */
export const DOMAIN_CHECK_BATCH_SIZE = 12;

/** Provider checks in flight at once for one search. */
const CONCURRENCY = 4;

/** A registrar to search: its extensions and a batch availability check. */
export interface DomainSearcher {
  /** Every extension that can be registered, alphabetically. */
  extensions: string[];
  /** Availability and prices for up to one batch of extensions. */
  check(
    name: string,
    extensions: string[],
    signal?: AbortSignal,
  ): Promise<DomainSearchResult[]>;
}

export interface DomainSearchPage {
  name: string;
  offset: number;
  limit: number;
  /** Check only this extension. */
  tld?: string;
}

/**
 * Checks one page of extensions, most relevant first, and yields each batch as
 * soon as the provider answers it, so results appear while the rest load.
 */
export async function* streamDomainSearch(
  searcher: DomainSearcher,
  page: DomainSearchPage,
  signal: AbortSignal,
  onBatchError: (error: unknown) => void = () => {},
): AsyncGenerator<DomainSearchEvent> {
  const ranked = page.tld
    ? searcher.extensions.filter((extension) => extension === page.tld)
    : rankExtensions(searcher.extensions);
  if (page.offset === 0) {
    yield { type: "meta", catalog: searcher.extensions, total: ranked.length };
  }

  const extensions = ranked.slice(page.offset, page.offset + page.limit);
  const batches = chunk(extensions, DOMAIN_CHECK_BATCH_SIZE);
  const checks = batches.map(
    (batch) => () => searcher.check(page.name, batch, signal),
  );
  let failed = false;
  for await (const { index, outcome } of inArrivalOrder(checks, CONCURRENCY)) {
    if (signal.aborted) return;
    const batch = batches[index] ?? [];
    if (outcome.status === "rejected") {
      failed = true;
      onBatchError(outcome.reason);
      continue;
    }
    yield {
      type: "results",
      start: page.offset + index * DOMAIN_CHECK_BATCH_SIZE,
      results: inBatchOrder(outcome.value, batch),
    };
  }
  if (failed) {
    yield {
      type: "warning",
      message:
        "Some domain results could not be checked. Retry the search to refresh them.",
    };
  }
  const end = page.offset + page.limit;
  yield { type: "done", nextOffset: end < ranked.length ? end : null };
}

/** The curated extensions first, then everything else alphabetically. */
function rankExtensions(catalog: string[]): string[] {
  const relevant = relevantDomainExtensions(catalog);
  const featured = new Set(relevant);
  return [
    ...relevant,
    ...catalog.filter((extension) => !featured.has(extension)),
  ];
}

/** Orders a batch's results the way its extensions were requested. */
function inBatchOrder(
  results: DomainSearchResult[],
  batch: string[],
): DomainSearchResult[] {
  const position = new Map(batch.map((extension, index) => [extension, index]));
  const rank = (result: DomainSearchResult) =>
    position.get(result.domain.slice(result.domain.indexOf(".") + 1)) ??
    batch.length;
  return [...results].sort((a, b) => rank(a) - rank(b));
}

/** Runs tasks with limited concurrency and yields each outcome as it settles. */
async function* inArrivalOrder<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number,
): AsyncGenerator<{ index: number; outcome: PromiseSettledResult<T> }> {
  type Settled = { index: number; outcome: PromiseSettledResult<T> };
  const running = new Map<number, Promise<Settled>>();
  let next = 0;
  const start = () => {
    const index = next++;
    const task = tasks[index];
    if (!task) return;
    running.set(
      index,
      task().then(
        (value): Settled => ({
          index,
          outcome: { status: "fulfilled", value },
        }),
        (reason): Settled => ({
          index,
          outcome: { status: "rejected", reason },
        }),
      ),
    );
  };
  while (next < tasks.length && running.size < concurrency) start();
  while (running.size > 0) {
    const settled = await Promise.race(running.values());
    running.delete(settled.index);
    if (next < tasks.length) start();
    yield settled;
  }
}

function chunk<T>(values: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, index * size + size),
  );
}
