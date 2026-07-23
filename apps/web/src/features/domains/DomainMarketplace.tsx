"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DomainProjectOption } from "@/lib/services/domain.service";
import { DomainCartSheet } from "./DomainCartSheet";
import { DomainCheckoutDialog } from "./DomainCheckoutDialog";
import { useDomainCommerce } from "./DomainCommerceProvider";
import {
  type AvailabilityFilter,
  DomainFilters,
  type DomainSort,
} from "./DomainFilters";
import { DomainResult, DomainResultSkeleton } from "./DomainResult";
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
  source,
  projects,
  sandboxEnabled,
  openCheckout,
}: {
  query: string;
  teamSlug?: string;
  source?: string;
  projects: DomainProjectOption[];
  sandboxEnabled: boolean;
  openCheckout: boolean;
}) {
  const { cartItem, hydrated, setCartOpen } = useDomainCommerce();
  const [value, setValue] = useState(query);
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [state, setState] = useState<SearchState>(query ? "loading" : "idle");
  const [message, setMessage] = useState("");
  const [catalog, setCatalog] = useState<string[]>([]);
  const [requestedExtensions, setRequestedExtensions] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [tld, setTld] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<DomainSort>("relevance");
  const [limit, setLimit] = useState(60);
  const [checkoutDomain, setCheckoutDomain] =
    useState<DomainSearchResult | null>(null);
  const searching = normalizeDomainQuery(value).length >= 2;

  useEffect(() => {
    if (!openCheckout || !hydrated || !cartItem) return;
    setCartOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [cartItem, hydrated, openCheckout, setCartOpen]);

  function updateValue(nextValue: string) {
    if (!searching && normalizeDomainQuery(nextValue).length >= 2) {
      window.scrollTo({ top: 0 });
    }
    setValue(nextValue);
  }

  useEffect(() => {
    const name = normalizeDomainQuery(value);
    if (name.length < 2) {
      setResults([]);
      setRequestedExtensions([]);
      setState("idle");
      return;
    }
    const initialExtensions = tld
      ? [tld]
      : [...RELEVANT_DOMAIN_EXTENSIONS].slice(0, 4);
    setResults([]);
    setRequestedExtensions(
      tld ? [tld] : [...RELEVANT_DOMAIN_EXTENSIONS].slice(0, limit),
    );
    setMessage("");
    setState("loading");
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({ q: name });
      if (teamSlug) params.set("teamSlug", teamSlug);
      if (source) params.set("source", source);
      window.history.replaceState(null, "", `/domains?${params}`);
      try {
        const first = await fetchDomainBatch(
          name,
          initialExtensions,
          controller.signal,
          true,
        );
        if (!first.response.ok) {
          setMessage(first.body.message ?? "");
          setRequestedExtensions([]);
          setState(
            first.body.error === "provider_not_configured"
              ? "not-configured"
              : "error",
          );
          return;
        }

        await revealDomainResults(
          first.body.results,
          controller.signal,
          setResults,
        );
        setState("ready");

        let detailed: Awaited<ReturnType<typeof fetchDomainBatch>>;
        try {
          detailed = await fetchDomainBatch(
            name,
            [...RELEVANT_DOMAIN_EXTENSIONS].slice(0, 12),
            controller.signal,
          );
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          setMessage(
            "Additional domain results could not be loaded. Retry the search to refresh them.",
          );
          return;
        }
        if (!detailed.response.ok) {
          setMessage(
            detailed.body.message ??
              "Additional domain results could not be loaded.",
          );
          return;
        }

        const nextCatalog = detailed.body.catalog ?? [];
        const relevant = relevantDomainExtensions(nextCatalog);
        const relevantSet = new Set(relevant);
        const remainder = nextCatalog.filter(
          (extension) => !relevantSet.has(extension),
        );
        const targetExtensions = tld
          ? [tld]
          : [...relevant, ...remainder].slice(0, limit);
        setCatalog(nextCatalog);
        setTotal(detailed.body.total ?? nextCatalog.length);
        setRequestedExtensions(targetExtensions);
        await revealDomainResults(
          detailed.body.results,
          controller.signal,
          setResults,
        );

        const initiallyLoaded = new Set(
          RELEVANT_DOMAIN_EXTENSIONS.slice(0, 12),
        );
        const remaining = targetExtensions.filter(
          (extension) =>
            !initiallyLoaded.has(
              extension as (typeof RELEVANT_DOMAIN_EXTENSIONS)[number],
            ),
        );
        const batches = chunk(remaining, 12);
        let cursor = 0;
        const worker = async () => {
          while (cursor < batches.length && !controller.signal.aborted) {
            const batch = batches[cursor];
            cursor += 1;
            if (!batch) return;
            try {
              const next = await fetchDomainBatch(
                name,
                batch,
                controller.signal,
              );
              ensureSuccessfulResponse(next.response);
              await revealDomainResults(
                next.body.results,
                controller.signal,
                setResults,
              );
            } catch (error) {
              if (error instanceof DOMException && error.name === "AbortError")
                return;
              setMessage(
                "Some domain results could not be checked. Retry the search to refresh them.",
              );
            }
          }
        };
        await Promise.all([worker(), worker()]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState("error");
        setMessage("The provider request could not be completed.");
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [limit, source, teamSlug, tld, value]);

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
            {(state === "loading" || state === "ready") &&
            requestedExtensions.length ? (
              <Results
                results={visibleResults}
                requestedExtensions={requestedExtensions}
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
      {checkoutDomain ? (
        <DomainCheckoutDialog
          result={checkoutDomain}
          projects={projects}
          teamSlug={teamSlug}
          sandboxEnabled={sandboxEnabled}
          onClose={() => setCheckoutDomain(null)}
        />
      ) : null}
      <DomainCartSheet onCheckout={setCheckoutDomain} />
      <SavedDomainsSheet />
    </main>
  );
}

function Results({
  results,
  requestedExtensions,
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
  requestedExtensions: string[];
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
  const { addToCart, isSignedIn, isSaved, toggleSaved } = useDomainCommerce();
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
      } catch {
        toast.error("Saved domains could not be updated.");
      }
    },
    onAdd: addToCart,
  };
  const byExtension = new Map(
    results.map((result) => [domainExtension(result.domain), result]),
  );
  const slots =
    sort === "relevance"
      ? requestedExtensions.map((extension) => ({
          extension,
          result: byExtension.get(extension),
        }))
      : results.map((result) => ({
          extension: domainExtension(result.domain),
          result,
        }));
  const visibleSlots =
    availability === "available"
      ? slots.filter((slot) => !slot.result || slot.result.available)
      : slots;
  const topSlots = requestedExtensions.slice(0, 4).map((extension) => ({
    extension,
    result: byExtension.get(extension),
  }));

  return (
    <>
      <h1 className="mb-3 text-xl font-semibold">Top results</h1>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {topSlots.map(({ extension, result }) =>
          result ? (
            <DomainResult
              key={result.domain}
              result={result}
              featured
              canSave={isSignedIn}
              saved={isSaved(result.domain)}
              {...actions}
            />
          ) : (
            <DomainResultSkeleton key={extension} featured />
          ),
        )}
      </div>
      <div className="mb-3 mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">All results</h2>
          {total > 0 ? (
            <p className="mt-1 text-xs text-white/35">
              {total.toLocaleString("en-US")} domain extensions
            </p>
          ) : (
            <div
              aria-hidden="true"
              className="mt-2 h-2.5 w-32 animate-pulse bg-white/6"
            />
          )}
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
        {visibleSlots.map(({ extension, result }) =>
          result ? (
            <DomainResult
              key={result.domain}
              result={result}
              canSave={isSignedIn}
              saved={isSaved(result.domain)}
              {...actions}
            />
          ) : (
            <DomainResultSkeleton key={extension} />
          ),
        )}
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

async function fetchDomainBatch(
  name: string,
  extensions: string[],
  signal: AbortSignal,
  fast = false,
) {
  const endpoint = new URL("/api/domains/search", window.location.origin);
  endpoint.searchParams.set("q", name);
  endpoint.searchParams.set("tlds", extensions.join(","));
  if (fast) endpoint.searchParams.set("fast", "1");
  const response = await fetch(endpoint, { signal });
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

async function revealDomainResults(
  incoming: DomainSearchResult[],
  signal: AbortSignal,
  update: React.Dispatch<React.SetStateAction<DomainSearchResult[]>>,
) {
  for (const result of incoming) {
    if (signal.aborted) return;
    update((current) => [
      ...current.filter((item) => item.domain !== result.domain),
      result,
    ]);
    await new Promise((resolve) => window.setTimeout(resolve, 35));
  }
}

function chunk<T>(values: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, index * size + size),
  );
}

function domainExtension(domain: string): string {
  return domain.slice(domain.indexOf(".") + 1);
}
