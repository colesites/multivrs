"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDomainCommerce } from "./DomainCommerceProvider";
import {
  type AvailabilityFilter,
  DomainFilters,
  type DomainSort,
} from "./DomainFilters";
import { DomainResult } from "./DomainResult";
import { DomainResultsSkeleton } from "./DomainResultsSkeleton";
import { DomainSearchField } from "./DomainSearchField";
import type { DomainSearchResult } from "./domain-marketplace";
import { normalizeDomainQuery } from "./domain-marketplace";
import { RotatingDomainWord } from "./RotatingDomainWord";
import { useDomainSearch } from "./use-domain-search";

export function DomainMarketplace() {
  const searchParams = useSearchParams();
  const { username } = useDomainCommerce();
  const query = searchParams.get("q") ?? "";
  const teamSlug = searchParams.get("teamSlug") ?? username ?? undefined;
  const projectSlug = searchParams.get("projectSlug") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const [editedValue, setEditedValue] = useState<string>();
  const [tld, setTld] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<DomainSort>("relevance");
  const value = editedValue ?? query;
  const normalizedQuery = normalizeDomainQuery(value);
  const searching = normalizedQuery.length >= 2;
  const search = useDomainSearch(normalizedQuery, tld);
  const { results, status } = search;

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
    <>
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
          {status === "loading" ? <DomainResultsSkeleton /> : null}
          {status === "not-configured" ? (
            <Status message="Domain search is not configured." />
          ) : null}
          {status === "error" && !results.length ? (
            <Status
              message={
                search.message ||
                "Domain availability is temporarily unavailable."
              }
            />
          ) : null}
          {status === "ready" && !results.length ? (
            <Status message="No extensions to show for this search." />
          ) : null}
          {results.length ? (
            <Results
              results={visibleResults}
              catalog={search.catalog}
              total={search.total}
              tld={tld}
              onTldChange={setTld}
              availability={availability}
              onAvailabilityChange={setAvailability}
              sort={sort}
              onSortChange={setSort}
              checking={status === "streaming"}
              canLoadMore={search.canLoadMore}
              loadingMore={search.loadingMore}
              onLoadMore={search.loadMore}
            />
          ) : null}
          {results.length && search.message ? (
            <p className="mt-4 text-xs text-amber-200/70">{search.message}</p>
          ) : null}
        </section>
      ) : null}
    </>
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
  checking,
  canLoadMore,
  loadingMore,
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
  /** More batches are still being checked. */
  checking: boolean;
  canLoadMore: boolean;
  loadingMore: boolean;
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
          <p className="mt-1 text-xs text-white/35" aria-live="polite">
            {checking
              ? `Checked ${results.length.toLocaleString("en-US")} so far, checking more…`
              : total > 0
                ? `${total.toLocaleString("en-US")} domain extensions`
                : null}
          </p>
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
      {canLoadMore || loadingMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadingMore}
          className="mt-5 h-10 w-full border border-white/15 text-sm text-white/65 hover:bg-white/5 disabled:cursor-wait disabled:opacity-60"
        >
          {loadingMore ? "Checking more extensions…" : "Load more"}
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
