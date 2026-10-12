"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type {
  MailDashboardData,
  MailMessageDetail,
  MailResources,
} from "@/features/mail/mail.types";
import { type MailView, parseMailView } from "@/features/mail/mail-view";

interface MailContextValue {
  /**
   * Counts, mailboxes, resources and recent threads. A promise, so pages can
   * show their static parts at once and suspend only where they need it
   * (read it with `useMailData`).
   */
  shell: Promise<MailDashboardData>;
  /** Resource lists; only resource pages wait on these (`useMailResources`). */
  resources: Promise<MailResources>;
  projectId?: string;
  view: MailView;
  setView: (view: MailView) => void;
  composeOpen: boolean;
  setComposeOpen: (open: boolean) => void;
  reply: MailMessageDetail | undefined;
  setReply: Dispatch<SetStateAction<MailMessageDetail | undefined>>;
  forward: MailMessageDetail | undefined;
  setForward: Dispatch<SetStateAction<MailMessageDetail | undefined>>;
  openCompose: () => void;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  /** Bumps when mail changes here (e.g. one is sent), so open lists refetch. */
  mailVersion: number;
  notifyMailChanged: () => void;
}

const MailContext = createContext<MailContextValue | null>(null);

let globalMailCtx: MailContextValue | null = null;
const listeners = new Set<() => void>();

export function useGlobalMailStore() {
  return useSyncExternalStore(subscribe, getGlobalSnapshot, getServerSnapshot);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getGlobalSnapshot() {
  return globalMailCtx;
}

function getServerSnapshot() {
  return null;
}

export function MailProvider({
  children,
  resources,
  shell,
  initialCompose = false,
  initialView = "overview",
  projectId,
}: {
  children: ReactNode;
  resources: Promise<MailResources>;
  shell: Promise<MailDashboardData>;
  initialCompose?: boolean;
  initialView?: MailView;
  projectId?: string;
}) {
  const [view, setViewState] = useState<MailView>(initialView);
  const [composeOpen, setComposeOpenState] = useState(initialCompose);
  const [reply, setReply] = useState<MailMessageDetail | undefined>(undefined);
  const [forward, setForward] = useState<MailMessageDetail | undefined>(
    undefined,
  );

  const openCompose = useCallback(() => {
    setReply(undefined);
    setForward(undefined);
    setComposeOpenState(true);
  }, []);
  const [query, setQuery] = useState("");
  const [mailVersion, setMailVersion] = useState(0);
  const notifyMailChanged = useCallback(
    () => setMailVersion((version) => version + 1),
    [],
  );
  const setComposeOpen = useCallback((open: boolean) => {
    setComposeOpenState(open);
    if (!open) {
      const url = new URL(window.location.href);
      url.searchParams.delete("compose");
      window.history.replaceState(null, "", url);
    }
  }, []);
  const setView = useCallback((nextView: MailView) => {
    setViewState(nextView);
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    window.history.pushState(null, "", url);
  }, []);

  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const nextView = searchParams.get("view");
    if (nextView) {
      setViewState(parseMailView(nextView));
    } else if (pathname.endsWith("/emails")) {
      setViewState(initialView);
    }
  }, [searchParams, pathname, initialView]);

  useEffect(() => {
    const syncView = () => {
      const nextView =
        new URL(window.location.href).searchParams.get("view") ?? undefined;
      setViewState(parseMailView(nextView));
    };
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const value = useMemo(
    () => ({
      shell,
      resources,
      projectId,
      view,
      setView,
      composeOpen,
      setComposeOpen,
      reply,
      setReply,
      forward,
      setForward,
      openCompose,
      query,
      setQuery,
      mailVersion,
      notifyMailChanged,
    }),
    [
      shell,
      resources,
      projectId,
      view,
      setView,
      composeOpen,
      setComposeOpen,
      reply,
      forward,
      openCompose,
      query,
      mailVersion,
      notifyMailChanged,
    ],
  );

  useEffect(() => {
    globalMailCtx = value;
    listeners.forEach((l) => {
      l();
    });
  }, [value]);

  useEffect(() => {
    return () => {
      globalMailCtx = null;
      listeners.forEach((l) => {
        l();
      });
    };
  }, []);

  return <MailContext.Provider value={value}>{children}</MailContext.Provider>;
}

export function useMailContext() {
  const ctx = useContext(MailContext);
  if (!ctx)
    throw new Error("useMailContext must be used within a MailProvider");
  return ctx;
}

/**
 * Returns the mail context if inside a MailProvider, or null if outside.
 * Used by the Sidebar to conditionally render mail navigation.
 */
export function useOptionalMailContext() {
  return useContext(MailContext);
}

/** The shared mail data. Suspends until it arrives, so render it in Suspense. */
export function useMailData(): MailDashboardData {
  return use(useMailContext().shell);
}

/** The account's resource lists. Suspends until they arrive. */
export function useMailResources(): MailResources {
  return use(useMailContext().resources);
}
