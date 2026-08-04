"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type {
  MailDashboardData,
  MailMessageDetail,
} from "@/features/mail/mail.types";
import { type MailView, parseMailView } from "@/features/mail/mail-view";

interface MailContextValue {
  data: MailDashboardData;
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
  data,
  initialCompose = false,
  initialView = "overview",
  projectId,
}: {
  children: ReactNode;
  data: MailDashboardData;
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

  const openCompose = () => {
    setReply(undefined);
    setForward(undefined);
    setComposeOpenState(true);
  };
  const [query, setQuery] = useState("");
  const setComposeOpen = (open: boolean) => {
    setComposeOpenState(open);
    if (!open) {
      const url = new URL(window.location.href);
      url.searchParams.delete("compose");
      window.history.replaceState(null, "", url);
    }
  };
  const setView = (nextView: MailView) => {
    setViewState(nextView);
    const url = new URL(window.location.href);
    url.searchParams.set("view", nextView);
    window.history.pushState(null, "", url);
  };

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

  const value = {
    data,
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
  };

  useEffect(() => {
    globalMailCtx = value;
    listeners.forEach((l) => {
      l();
    });
  });

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
