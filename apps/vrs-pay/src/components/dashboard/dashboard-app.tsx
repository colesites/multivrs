"use client";

import { Loader2 } from "lucide-react";
import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { dashboardFetch, SignedOut } from "./api";
import { DashboardContext } from "./context";
import { DashboardSidebar, MobileHeader } from "./nav";
import { VIEWS, type ViewId } from "./nav-items";
import { readScope, saveScope, settledScope } from "./scope";
import type { DashboardSession, Scope } from "./types";
import { BalanceView } from "./views/balance";
import { CustomersView } from "./views/customers";
import { DevelopersView } from "./views/developers";
import { EventsView } from "./views/events";
import { InvoicesView } from "./views/invoices";
import { OverviewView } from "./views/overview";
import { PaymentLinksView } from "./views/payment-links";
import { PaymentsView } from "./views/payments";
import { ProductsView } from "./views/products";
import { SettingsView } from "./views/settings";
import { SetupView } from "./views/setup";
import { SubscriptionsView } from "./views/subscriptions";

const SCREENS: Record<ViewId, ComponentType> = {
  overview: OverviewView,
  payments: PaymentsView,
  balance: BalanceView,
  customers: CustomersView,
  subscriptions: SubscriptionsView,
  invoices: InvoicesView,
  products: ProductsView,
  links: PaymentLinksView,
  developers: DevelopersView,
  events: EventsView,
  setup: SetupView,
  settings: SettingsView,
};

function viewFromUrl(): ViewId {
  const view = new URLSearchParams(window.location.search).get("view");
  return VIEWS.find((v) => v.id === view)?.id ?? "overview";
}

const sameScope = (a: Scope, b: Scope) =>
  a.merchant === b.merchant && a.mode === b.mode;

/** The signed-in dashboard. Signed-out visitors are sent to /sign-in. */
export function DashboardApp({ apiUrl }: { apiUrl: string }) {
  const [session, setSession] = useState<DashboardSession | null>(null);
  const [scope, setScope] = useState<Scope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>("overview");

  useEffect(() => {
    setView(viewFromUrl());
    setScope(readScope());
  }, []);

  const refreshSession = useCallback(async () => {
    if (!scope) return;
    try {
      const next = await dashboardFetch<DashboardSession>(apiUrl, "/me", scope);
      const settled = settledScope(next);
      saveScope(settled);
      // The server may have picked another business, or live isn't open yet: follow it.
      if (!sameScope(settled, scope)) return setScope(settled);
      setSession(next);
    } catch (e: unknown) {
      if (e instanceof SignedOut) window.location.replace("/sign-in");
      else
        setError(
          e instanceof Error ? e.message : "Couldn't load your account.",
        );
    }
  }, [apiUrl, scope]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const switchTo = useCallback((next: Partial<Scope>) => {
    setSession(null);
    setScope((current) => ({ ...(current ?? readScope()), ...next }));
  }, []);

  const navigate = useCallback((next: string) => {
    const id = VIEWS.find((v) => v.id === next)?.id ?? "overview";
    // replaceState: the framework's navigator re-renders on popstate, so we
    // avoid adding history entries for in-dashboard tabs.
    window.history.replaceState(
      null,
      "",
      id === "overview" ? "/dashboard" : `/dashboard?view=${id}`,
    );
    setView(id);
    window.scrollTo({ top: 0 });
  }, []);

  const context = useMemo(
    () =>
      session && scope
        ? { apiUrl, session, scope, switchTo, refreshSession, navigate }
        : null,
    [apiUrl, session, scope, switchTo, refreshSession, navigate],
  );

  if (error) return <p className="p-10 text-sm text-red-700">{error}</p>;
  if (!context) {
    return (
      <div className="grid min-h-dvh place-items-center text-mute">
        <Loader2 className="size-5 animate-spin" aria-label="Loading" />
      </div>
    );
  }
  const Screen = SCREENS[view];
  return (
    <DashboardContext.Provider value={context}>
      <div className="min-h-dvh bg-white">
        <MobileHeader view={view} onPick={navigate} />
        <SidebarProvider>
          <DashboardSidebar view={view} onPick={navigate} />
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:py-10">
            <div className="mx-auto max-w-6xl">
              <Screen key={`${context.scope.merchant}:${context.scope.mode}`} />
            </div>
          </main>
        </SidebarProvider>
      </div>
    </DashboardContext.Provider>
  );
}
