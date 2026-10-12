"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import type {
  MailLogPage,
  MailMessageDetail,
  MailThreadPage,
} from "@/features/mail/mail.types";
import { useMailContext } from "@/features/mail/mail-context";
import type { MailView } from "@/features/mail/mail-view";

const THREADS = "mail-threads";
const THREAD = "mail-thread";
const LOG = "mail-log";

/** Wait this long after typing in search before asking the server. */
const SEARCH_DEBOUNCE_MS = 250;

/** The project in view, or the account in the URL, as API query params. */
function useMailTarget(): string {
  const { projectId } = useMailContext();
  const params = useParams<{ username?: string }>();
  return new URLSearchParams(
    projectId
      ? { projectId }
      : params.username
        ? { account: params.username }
        : {},
  ).toString();
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mail request failed (${response.status})`);
  return (await response.json()) as T;
}

function useDebounced(value: string): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced(value),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [value]);
  return debounced;
}

/**
 * A folder's threads, one page at a time. The first page shows as soon as it
 * arrives; `loadMore` fetches the next one from the last row's cursor.
 */
export function useMailThreads(view: MailView, query: string) {
  const target = useMailTarget();
  const q = useDebounced(query.trim());
  const pages = useSWRInfinite<MailThreadPage>(
    (index, previous: MailThreadPage | null) => {
      if (previous && !previous.nextCursor) return null;
      const params = new URLSearchParams(target);
      params.set("view", view);
      if (q) params.set("q", q);
      if (index > 0 && previous?.nextCursor) {
        params.set("cursor", previous.nextCursor);
      }
      return [THREADS, `/api/mail/threads?${params}`];
    },
    ([, url]: [string, string]) => getJson<MailThreadPage>(url),
    { revalidateFirstPage: false, revalidateOnFocus: false },
  );
  // Refetch what's loaded when mail changes elsewhere on the page.
  const { mailVersion } = useMailContext();
  const { mutate } = pages;
  useEffect(() => {
    if (mailVersion) void mutate();
  }, [mailVersion, mutate]);
  const loaded = pages.data ?? [];
  const last = loaded.at(-1);
  return {
    threads: loaded.flatMap((page) => page.threads),
    loading: !pages.data && !pages.error,
    error: pages.error as Error | undefined,
    hasMore: Boolean(last?.nextCursor),
    loadingMore: pages.data !== undefined && pages.data.length < pages.size,
    loadMore: () => {
      if (last?.nextCursor) void pages.setSize(pages.size + 1);
    },
    /** Refetch the pages already loaded, e.g. after an action. */
    refresh: () => pages.mutate(),
  };
}

/** A conversation's messages, fetched when it's opened. */
export function useMailThread(threadId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<MailMessageDetail[]>(
    threadId ? [THREAD, `/api/mail/threads/${threadId}`] : null,
    ([, url]: [string, string]) => getJson<MailMessageDetail[]>(url),
    { revalidateOnFocus: false },
  );
  return {
    messages: data,
    error: error as Error | undefined,
    loading: isLoading,
    refresh: () => mutate(),
  };
}

/** The email log, one page at a time. */
export function useMailLog() {
  const target = useMailTarget();
  const pages = useSWRInfinite<MailLogPage>(
    (index, previous: MailLogPage | null) => {
      if (previous && !previous.nextCursor) return null;
      const params = new URLSearchParams(target);
      if (index > 0 && previous?.nextCursor) {
        params.set("cursor", previous.nextCursor);
      }
      return [LOG, `/api/mail/logs?${params}`];
    },
    ([, url]: [string, string]) => getJson<MailLogPage>(url),
    { revalidateOnFocus: false },
  );
  const { mailVersion } = useMailContext();
  const { mutate } = pages;
  useEffect(() => {
    if (mailVersion) void mutate();
  }, [mailVersion, mutate]);
  const last = pages.data?.at(-1);
  return {
    items: (pages.data ?? []).flatMap((page) => page.items),
    loading: !pages.data && !pages.error,
    hasMore: Boolean(last?.nextCursor),
    loadingMore: pages.data !== undefined && pages.data.length < pages.size,
    loadMore: () => {
      if (last?.nextCursor) void pages.setSize(pages.size + 1);
    },
  };
}
