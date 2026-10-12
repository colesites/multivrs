/**
 * domains — streamed search: each batch of extensions is sent as soon as the
 * registrar answers it, ranked by relevance, and a page ends with where to
 * continue.
 */
import { describe, expect, test } from "bun:test";
import type {
  DomainSearchEvent,
  DomainSearchResult,
} from "../../apps/web/src/features/domains/domain-marketplace";
import {
  type DomainSearcher,
  streamDomainSearch,
} from "../../apps/web/src/lib/domains/domain-search-stream";

const result = (domain: string): DomainSearchResult => ({
  domain,
  available: true,
  premium: false,
  price: 10,
  currency: "USD",
});

/** A registrar whose batches answer after the given delay; null fails. */
function fakeSearcher(
  extensions: string[],
  delayFor: (batch: string[]) => number | null,
): DomainSearcher & { calls: string[][] } {
  const calls: string[][] = [];
  return {
    calls,
    extensions,
    async check(name, batch) {
      calls.push(batch);
      const delay = delayFor(batch);
      await Bun.sleep(delay ?? 5);
      if (delay === null) throw new Error("registrar timeout");
      // Answer out of order, as a registrar might.
      return [...batch].reverse().map((tld) => result(`${name}.${tld}`));
    },
  };
}

async function collect(stream: AsyncGenerator<DomainSearchEvent>) {
  const events: DomainSearchEvent[] = [];
  for await (const event of stream) events.push(event);
  return events;
}

// 30 alphabetical extensions, three of which are on the curated list.
const catalog = [
  ...Array.from({ length: 27 }, (_, index) => `x${String(index).padStart(2, "0")}`),
  "app",
  "com",
  "dev",
].sort();

describe("streamed domain search", () => {
  test("sends each batch as it arrives, ranked, then where to continue", async () => {
    // The first (most relevant) batch is slowest, so a later one lands first.
    const searcher = fakeSearcher(catalog, (batch) => (batch.includes("com") ? 60 : 10));
    const events = await collect(
      streamDomainSearch(
        searcher,
        { name: "acme", offset: 0, limit: 24 },
        new AbortController().signal,
      ),
    );

    expect(events[0]).toEqual({ type: "meta", catalog, total: 30 });
    const batches = events.filter((event) => event.type === "results");
    expect(batches.map((event) => event.start)).toEqual([12, 0]);
    // Curated extensions lead the first batch, in curated order.
    const first = batches.find((event) => event.start === 0);
    expect(first?.results.slice(0, 3).map((item) => item.domain)).toEqual([
      "acme.com",
      "acme.dev",
      "acme.app",
    ]);
    expect(events.at(-1)).toEqual({ type: "done", nextOffset: 24 });
  });

  test("a later page skips the catalog and ends the search", async () => {
    const searcher = fakeSearcher(catalog, () => 1);
    const events = await collect(
      streamDomainSearch(
        searcher,
        { name: "acme", offset: 24, limit: 24 },
        new AbortController().signal,
      ),
    );
    expect(events.some((event) => event.type === "meta")).toBe(false);
    expect(searcher.calls.flat()).toHaveLength(6);
    expect(events.at(-1)).toEqual({ type: "done", nextOffset: null });
  });

  test("keeps the batches that worked when one fails", async () => {
    const errors: unknown[] = [];
    const searcher = fakeSearcher(catalog, (batch) => (batch.includes("com") ? null : 1));
    const events = await collect(
      streamDomainSearch(
        searcher,
        { name: "acme", offset: 0, limit: 24 },
        new AbortController().signal,
        (error) => errors.push(error),
      ),
    );
    expect(events.filter((event) => event.type === "results")).toHaveLength(1);
    expect(events.some((event) => event.type === "warning")).toBe(true);
    expect(errors).toHaveLength(1);
    expect(events.at(-1)?.type).toBe("done");
  });

  test("checks at most four batches at once", async () => {
    let running = 0;
    let peak = 0;
    const searcher: DomainSearcher = {
      extensions: catalog,
      async check(name, batch) {
        running += 1;
        peak = Math.max(peak, running);
        await Bun.sleep(5);
        running -= 1;
        return batch.map((tld) => result(`${name}.${tld}`));
      },
    };
    const many = Array.from({ length: 120 }, (_, index) => `y${index}`).sort();
    await collect(
      streamDomainSearch(
        { ...searcher, extensions: many },
        { name: "acme", offset: 0, limit: 120 },
        new AbortController().signal,
      ),
    );
    expect(peak).toBe(4);
  });
});
