"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { DomainCartSheet } from "./DomainCartSheet";
import { useDomainCommerce } from "./DomainCommerceProvider";
import {
  type AvailabilityFilter,
  DomainFilters,
  type DomainSort,
} from "./DomainFilters";
import { DomainResult } from "./DomainResult";
import { DomainSearchField } from "./DomainSearchField";
import type { DomainSearchResult } from "./domain-marketplace";
import {
  normalizeDomainQuery,
  RELEVANT_DOMAIN_EXTENSIONS,
  relevantDomainExtensions,
} from "./domain-marketplace";
import { RotatingDomainWord } from "./RotatingDomainWord";
import { SavedDomainsSheet } from "./SavedDomainsSheet";

const Beams = dynamic(() => import("@/components/Beams"), { ssr: false });
type SearchState = "idle" | "loading" | "ready" | "not-configured" | "error";

export function DomainMarketplace({
  query,
  teamSlug,
  projectSlug,
  source,
}: {
  query: string;
  teamSlug?: string;
  projectSlug?: string;
  source?: string;
}) {
  const [editedValue, setEditedValue] = useState<string>();
  const [tld, setTld] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<DomainSort>("relevance");
  const [limit, setLimit] = useState(60);
  const value = editedValue ?? query;
  const normalizedQuery = normalizeDomainQuery(value);
  const deferredQuery = useDeferredValue(normalizedQuery);
  const searching = normalizedQuery.length >= 2;
  const querySettled = deferredQuery === normalizedQuery;
  const searchKey =
    deferredQuery.length >= 2
      ? ["domain-marketplace", deferredQuery, tld, limit]
      : null;
  const search = useSWR(
    searchKey,
    () => searchDomains({ name: deferredQuery, tld, limit }),
    { keepPreviousData: false },
  );
  const results = search.data?.results ?? [];
  const catalog = search.data?.catalog ?? [];
  const total = search.data?.total ?? 0;
  const message = search.data?.message ?? "";
  const state: SearchState = !searching
    ? "idle"
    : !querySettled || search.isLoading
      ? "loading"
      : search.error
        ? "error"
        : (search.data?.state ?? "error");

  function updateValue(nextValue: string) {
    if (!searching && normalizeDomainQuery(nextValue).length >= 2) {
      window.scrollTo({ top: 0 });
    }
    setEditedValue(nextValue);
    const name = normalizeDomainQuery(nextValue);
    const params = new URLSearchParams();
    if (name) params.set("q", name);
    if (teamSlug) params.set("teamSlug", teamSlug);
    if (projectSlug) params.set("projectSlug", projectSlug);
    if (source) params.set("source", source);
    window.history.replaceState(
      null,
      "",
      `/domains${params.size ? `?${params}` : ""}`,
    );
  }

  const visibleResults = sortResults(
    availability === "available"
      ? results.filter((result) => result.available)
      : results,
    sort,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-black pt-16 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <Beams
          beamNumber={14}
          beamWidth={1.8}
          lightColor="#60a5fa"
          speed={0.7}
          noiseIntensity={1.2}
          rotation={18}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-6">
        <section
          className={
            searching
              ? "mx-auto max-w-3xl pt-5"
              : "mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center text-center"
          }
        >
          {!searching ? (
            <>
              <h1 className="font-clash text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.95]">
                Find a domain for your
                <RotatingDomainWord />
              </h1>
              <p className="mb-7 mt-6 text-sm text-white/45">
                Fast. At-cost. Private.
              </p>
            </>
          ) : null}
          <DomainSearchField value={value} onChange={updateValue} />
        </section>

        {searching ? (
          <section className="pt-8">
            {state === "not-configured" ? (
              <Status message="Domain search is not configured." />
            ) : null}
            {state === "error" ? (
              <Status
                message={
                  message || "Domain availability is temporarily unavailable."
                }
              />
            ) : null}
            {state === "ready" && results.length ? (
              <Results
                results={visibleResults}
                catalog={catalog}
                total={total}
                tld={tld}
                onTldChange={(next) => {
                  setTld(next);
                  setLimit(60);
                }}
                availability={availability}
                onAvailabilityChange={setAvailability}
                sort={sort}
                onSortChange={setSort}
                canLoadMore={!tld && limit < total && limit < 180}
                onLoadMore={() =>
                  setLimit((current) => Math.min(180, current + 60))
                }
              />
            ) : null}
            {state === "ready" && message ? (
              <p className="mt-4 text-xs text-amber-200/70">{message}</p>
            ) : null}
          </section>
        ) : null}
      </div>
      <DomainCartSheet />
      <SavedDomainsSheet />
    </main>
  );
}

function Results({
  results,
  catalog,
  total,
  tld,
  onTldChange,
  availability,
  onAvailabilityChange,
  sort,
  onSortChange,
  canLoadMore,
  onLoadMore,
}: {
  results: DomainSearchResult[];
  catalog: string[];
  total: number;
  tld: string;
  onTldChange: (value: string) => void;
  availability: AvailabilityFilter;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  sort: DomainSort;
  onSortChange: (value: DomainSort) => void;
  canLoadMore: boolean;
  onLoadMore: () => void;
}) {
  const { isInCart, isSignedIn, isSaved, toggleCart, toggleSaved } =
    useDomainCommerce();
  const actions = {
    onSave: async (result: DomainSearchResult) => {
      const saved = isSaved(result.domain);
      try {
        await toggleSaved(result);
        toast.success(
          saved
            ? `${result.domain} removed from saved`
            : `${result.domain} saved`,
        );
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Saved domains could not be updated.",
        );
      }
    },
    onAdd: toggleCart,
  };
  const topResults = results.slice(0, 4);

  return (
    <>
      <h1 className="mb-3 text-xl font-semibold">Top results</h1>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {topResults.map((result) => (
          <DomainResult
            key={result.domain}
            result={result}
            featured
            canSave={isSignedIn}
            saved={isSaved(result.domain)}
            inCart={isInCart(result.domain)}
            {...actions}
          />
        ))}
      </div>
      <div className="mb-3 mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">All results</h2>
          {total > 0 ? (
            <p className="mt-1 text-xs text-white/35">
              {total.toLocaleString("en-US")} domain extensions
            </p>
          ) : null}
        </div>
        <DomainFilters
          catalog={catalog}
          tld={tld}
          onTldChange={onTldChange}
          availability={availability}
          onAvailabilityChange={onAvailabilityChange}
          sort={sort}
          onSortChange={onSortChange}
        />
      </div>
      <div className="grid border-l border-t border-white/8 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <DomainResult
            key={result.domain}
            result={result}
            canSave={isSignedIn}
            saved={isSaved(result.domain)}
            inCart={isInCart(result.domain)}
            {...actions}
          />
        ))}
      </div>
      {canLoadMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="mt-5 h-10 w-full border border-white/15 text-sm text-white/65 hover:bg-white/5"
        >
          Load more
        </button>
      ) : null}
    </>
  );
}

function sortResults(results: DomainSearchResult[], sort: DomainSort) {
  const copy = [...results];
  if (sort === "length")
    return copy.sort((a, b) => a.domain.length - b.domain.length);
  if (sort === "price")
    return copy.sort(
      (a, b) => (a.price ?? Number.MAX_VALUE) - (b.price ?? Number.MAX_VALUE),
    );
  if (sort === "alphabetical")
    return copy.sort((a, b) => a.domain.localeCompare(b.domain));
  return copy;
}

function Status({ message }: { message: string }) {
  return (
    <div className="border-y border-white/10 py-14 text-center text-sm text-white/45">
      {message}
    </div>
  );
}

type SearchResponse = {
  results: DomainSearchResult[];
  catalog?: string[];
  total?: number;
  error?: string;
  message?: string;
};

type DomainSearchData = {
  catalog: string[];
  message: string;
  results: DomainSearchResult[];
  state: Exclude<SearchState, "idle" | "loading">;
  total: number;
};

async function searchDomains({
  name,
  tld,
  limit,
}: {
  name: string;
  tld: string;
  limit: number;
}): Promise<DomainSearchData> {
  const initialExtensions = tld
    ? [tld]
    : [...RELEVANT_DOMAIN_EXTENSIONS].slice(0, 12);
  const initial = await fetchDomainBatch(name, initialExtensions);
  if (!initial.response.ok) {
    return {
      catalog: [],
      message: initial.body.message ?? "",
      results: [],
      state:
        initial.body.error === "provider_not_configured"
          ? "not-configured"
          : "error",
      total: 0,
    };
  }

  const catalog = initial.body.catalog ?? [];
  const relevant = relevantDomainExtensions(catalog);
  const relevantSet = new Set(relevant);
  const remainder = catalog.filter((extension) => !relevantSet.has(extension));
  const targetExtensions = tld
    ? [tld]
    : [...relevant, ...remainder].slice(0, limit);
  const loaded = new Set(initialExtensions);
  const batches = chunk(
    targetExtensions.filter((extension) => !loaded.has(extension)),
    12,
  );
  const byDomain = new Map(
    initial.body.results.map((result) => [result.domain, result]),
  );
  let message = "";
  let cursor = 0;
  const worker = async () => {
    while (cursor < batches.length) {
      const batch = batches[cursor];
      cursor += 1;
      if (!batch) return;
      try {
        const next = await fetchDomainBatch(name, batch);
        ensureSuccessfulResponse(next.response);
        for (const result of next.body.results) {
          byDomain.set(result.domain, result);
        }
      } catch {
        message =
          "Some domain results could not be checked. Retry the search to refresh them.";
      }
    }
  };
  await Promise.all([worker(), worker()]);

  return {
    catalog,
    message,
    results: [...byDomain.values()],
    state: "ready",
    total: initial.body.total ?? catalog.length,
  };
}

async function fetchDomainBatch(name: string, extensions: string[]) {
  const endpoint = new URL("/api/domains/search", window.location.origin);
  endpoint.searchParams.set("q", name);
  endpoint.searchParams.set("tlds", extensions.join(","));
  const response = await fetch(endpoint);
  if (!response.ok) {
    const body = (await response.json()) as SearchResponse;
    return { response, body };
  }
  const body = (await response.json()) as SearchResponse;
  return { response, body };
}

function ensureSuccessfulResponse(response: Response): void {
  if (!response.ok) throw new Error("Domain batch failed");
}

function chunk<T>(values: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, index * size + size),
  );
}
