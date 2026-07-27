"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { MailDashboardData, MailMessageDetail } from "@/features/mail/mail.types";
import type { MailView } from "@/features/mail/mail-navigation";

interface MailContextValue {
  data: MailDashboardData;
  projectId?: string;
  view: MailView;
  setView: Dispatch<SetStateAction<MailView>>;
  composeOpen: boolean;
  setComposeOpen: Dispatch<SetStateAction<boolean>>;
  reply: MailMessageDetail | undefined;
  setReply: Dispatch<SetStateAction<MailMessageDetail | undefined>>;
  openCompose: () => void;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

const MailContext = createContext<MailContextValue | null>(null);

let globalMailCtx: MailContextValue | null = null;
const listeners = new Set<() => void>();

export function useGlobalMailStore() {
  const [store, setStore] = useState(globalMailCtx);
  
  useEffect(() => {
    const listener = () => setStore(globalMailCtx);
    listeners.add(listener);
    setStore(globalMailCtx);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return store;
}

export function MailProvider({
  children,
  data,
  projectId,
}: {
  children: ReactNode;
  data: MailDashboardData;
  projectId?: string;
}) {
  const [view, setView] = useState<MailView>("overview");
  const [composeOpen, setComposeOpen] = useState(false);
  const [reply, setReply] = useState<MailMessageDetail>();

  const openCompose = useCallback(() => {
    setReply(undefined);
    setComposeOpen(true);
  }, []);
  const [query, setQuery] = useState("");

  const value = useMemo(
    () => ({
      data,
      projectId,
      view,
      setView,
      composeOpen,
      setComposeOpen,
      reply,
      setReply,
      openCompose,
      query,
      setQuery,
    }),
    [data, projectId, view, composeOpen, reply, query, openCompose]
  );

  useEffect(() => {
    globalMailCtx = value;
    listeners.forEach((l) => { l(); });
    return () => {
      globalMailCtx = null;
      listeners.forEach((l) => { l(); });
    };
  }, [value]);

  return (
    <MailContext.Provider value={value}>
      {children}
    </MailContext.Provider>
  );
}

export function useMailContext() {
  const ctx = useContext(MailContext);
  if (!ctx) throw new Error("useMailContext must be used within a MailProvider");
  return ctx;
}

/**
 * Returns the mail context if inside a MailProvider, or null if outside.
 * Used by the Sidebar to conditionally render mail navigation.
 */
export function useOptionalMailContext() {
  return useContext(MailContext);
}
