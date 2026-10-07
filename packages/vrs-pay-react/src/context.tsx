"use client";

import { createVrsPayClient, type VrsPayClient, type VrsPayClientOptions } from "@vrs-pay/js";
import { createContext, type ReactNode, useContext, useMemo, useRef } from "react";

const VrsPayContext = createContext<VrsPayClient | null>(null);

/**
 * Makes VRS Pay available to the components below. `customerSession` can
 * be a function that asks your server for a fresh session secret. Inline
 * functions are fine: a new one each render doesn't refetch everything.
 */
export function VrsPayProvider({
  children,
  publishableKey,
  apiUrl,
  customerSession,
  fetch,
}: VrsPayClientOptions & { children: ReactNode }) {
  const latest = useRef({ customerSession, fetch });
  latest.current = { customerSession, fetch };
  const sessionValue = typeof customerSession === "string" ? customerSession : null;
  const hasSessionFunction = typeof customerSession === "function";
  const hasFetch = fetch !== undefined;
  const client = useMemo(() => {
    const session = hasSessionFunction
      ? () => {
          const current = latest.current.customerSession;
          return typeof current === "function" ? current() : Promise.resolve(current ?? "");
        }
      : (sessionValue ?? undefined);
    const send: VrsPayClientOptions["fetch"] = hasFetch
      ? (input, init) => (latest.current.fetch ?? globalThis.fetch)(input, init)
      : undefined;
    return createVrsPayClient({ publishableKey, apiUrl, fetch: send, customerSession: session });
  }, [publishableKey, apiUrl, sessionValue, hasSessionFunction, hasFetch]);
  return <VrsPayContext.Provider value={client}>{children}</VrsPayContext.Provider>;
}

/** The VRS Pay browser client from the nearest <VrsPayProvider>. */
export function useVrsPay(): VrsPayClient {
  const client = useContext(VrsPayContext);
  if (!client) throw new Error("VRS Pay: wrap your app in <VrsPayProvider>.");
  return client;
}
