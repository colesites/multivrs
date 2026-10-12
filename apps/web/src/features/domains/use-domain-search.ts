"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DOMAIN_SEARCH_PAGE_SIZE,
  type DomainSearchEvent,
  type DomainSearchResult,
} from "./domain-marketplace";

export type DomainSearchStatus =
  | "idle"
  /** Nothing to show yet. */
  | "loading"
  /** Some results are in; more batches are still being checked. */
  | "streaming"
  | "ready"
  | "not-configured"
  | "error";

type RankedResult = { rank: number; result: DomainSearchResult };

interface SearchState {
  /** The name and extension these results are for. */
  key: string;
  status: DomainSearchStatus;
  results: RankedResult[];
  catalog: string[];
  total: number;
  message: string;
  nextOffset: number | null;
  loadingMore: boolean;
}

const EMPTY: SearchState = {
  key: "",
  status: "idle",
  results: [],
  catalog: [],
  total: 0,
  message: "",
  nextOffset: null,
  loadingMore: false,
};

/** Wait this long after typing stops before searching. */
const DEBOUNCE_MS = 250;

/**
 * Streams availability for `name` from `/api/domains/search`. Results grow as
 * each batch of extensions is checked, and `loadMore` fetches the next page
 * without re-checking what's already shown.
 */
export function useDomainSearch(name: string, tld: string) {
  const key = `${name}\u0000${tld}`;
  const [state, setState] = useState<SearchState>(EMPTY);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(
    (offset: number) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      let finished = false;

      const apply = (event: DomainSearchEvent) => {
        if (abort.signal.aborted) return;
        if (event.type === "done" || event.type === "error") finished = true;
        // A failed "Load more" keeps what's shown and offers it again.
        if (offset > 0 && event.type === "error") {
          setState((current) =>
            reduce(
              reduce(current, { type: "warning", message: event.message }),
              {
                type: "done",
                nextOffset: offset,
              },
            ),
          );
          return;
        }
        setState((current) => reduce(current, event));
      };

      setState((current) =>
        offset === 0
          ? { ...EMPTY, key, status: "loading" }
          : { ...current, loadingMore: true, message: "" },
      );

      const params = new URLSearchParams({
        q: name,
        offset: String(offset),
        limit: String(DOMAIN_SEARCH_PAGE_SIZE),
      });
      if (tld) params.set("tld", tld);
      void fetch(`/api/domains/search?${params}`, { signal: abort.signal })
        .then((response) => {
          if (!response.ok || !response.body) {
            throw new Error(`Domain search failed (${response.status})`);
          }
          return readEvents(response.body, apply);
        })
        .then(() => {
          // The connection closed early; keep what arrived.
          if (!finished) apply({ type: "done", nextOffset: null });
        })
        .catch(() =>
          apply({
            type: "error",
            code: "unavailable",
            message: "Domain availability is temporarily unavailable.",
          }),
        );
    },
    [key, name, tld],
  );

  useEffect(() => {
    if (name.length < 2) return;
    const timer = window.setTimeout(() => run(0), DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.current?.abort();
    };
  }, [name, run]);

  const current = name.length >= 2 && state.key === key;
  return {
    status: (name.length < 2
      ? "idle"
      : current
        ? state.status
        : "loading") satisfies DomainSearchStatus,
    results: current ? state.results.map((entry) => entry.result) : [],
    catalog: current ? state.catalog : [],
    total: current ? state.total : 0,
    message: current ? state.message : "",
    canLoadMore:
      current && state.status === "ready" && state.nextOffset !== null,
    loadingMore: current && state.loadingMore,
    loadMore: () => {
      if (state.nextOffset !== null) run(state.nextOffset);
    },
  };
}

function reduce(state: SearchState, event: DomainSearchEvent): SearchState {
  switch (event.type) {
    case "meta":
      return { ...state, catalog: event.catalog, total: event.total };
    case "results": {
      const byDomain = new Map(
        state.results.map((entry) => [entry.result.domain, entry]),
      );
      for (const [index, result] of event.results.entries()) {
        byDomain.set(result.domain, { rank: event.start + index, result });
      }
      return {
        ...state,
        status: state.status === "loading" ? "streaming" : state.status,
        results: [...byDomain.values()].sort((a, b) => a.rank - b.rank),
      };
    }
    case "warning":
      return { ...state, message: event.message };
    case "error":
      return {
        ...state,
        status: event.code === "not_configured" ? "not-configured" : "error",
        message: event.message,
        loadingMore: false,
      };
    case "done":
      return {
        ...state,
        status:
          state.status === "error" || state.status === "not-configured"
            ? state.status
            : "ready",
        nextOffset: event.nextOffset,
        loadingMore: false,
      };
  }
}

/** Calls `onEvent` for each JSON line as it arrives. */
async function readEvents(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: DomainSearchEvent) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as DomainSearchEvent);
    }
  }
  if (buffered.trim()) onEvent(JSON.parse(buffered) as DomainSearchEvent);
}
