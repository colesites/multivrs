import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { dashboardFetch, SignedOut } from "./api";
import type { DashboardSession, Scope } from "./types";

export interface DashboardContextValue {
  apiUrl: string;
  session: DashboardSession;
  scope: Scope;
  /** Show another business, or the other mode; the screen reloads. */
  switchTo: (next: Partial<Scope>) => void;
  /** Reloads the session (e.g. after connecting Stripe). */
  refreshSession: () => Promise<void>;
  navigate: (view: string) => void;
}

export const DashboardContext = createContext<DashboardContextValue | null>(
  null,
);

export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value)
    throw new Error("useDashboard must be used inside the dashboard.");
  return value;
}

/** GET a dashboard path, with loading/error state and a reload. */
export function useApi<T>(path: string) {
  const { apiUrl, scope } = useDashboard();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `version` re-runs the request on reload().
  useEffect(() => {
    let live = true;
    setError(null);
    dashboardFetch<T>(apiUrl, path, scope)
      .then((value) => live && setData(value))
      .catch((e: unknown) => {
        if (e instanceof SignedOut) window.location.replace("/sign-in");
        else if (live)
          setError(e instanceof Error ? e.message : "Couldn't load this.");
      });
    return () => {
      live = false;
    };
  }, [apiUrl, path, scope, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading: data === null && error === null, reload };
}

/** POST/DELETE to a dashboard path; returns the error message, if any. */
export function useAction() {
  const { apiUrl, scope } = useDashboard();
  const [pending, setPending] = useState(false);
  const run = useCallback(
    async <T>(
      path: string,
      init: { method?: string; body?: object },
    ): Promise<{ data?: T; error?: string }> => {
      setPending(true);
      try {
        return {
          data: await dashboardFetch<T>(apiUrl, path, scope, {
            body: {},
            ...init,
          }),
        };
      } catch (e: unknown) {
        if (e instanceof SignedOut) window.location.replace("/sign-in");
        return {
          error: e instanceof Error ? e.message : "Something went wrong.",
        };
      } finally {
        setPending(false);
      }
    },
    [apiUrl, scope],
  );
  return { run, pending };
}
