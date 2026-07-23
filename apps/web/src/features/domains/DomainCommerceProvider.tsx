"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  parseStoredDomain,
  savedDomainsSchema,
} from "./domain-commerce.schemas";
import type { DomainCommerceContextValue } from "./domain-commerce.types";
import type { DomainSearchResult } from "./domain-marketplace";

const CART_STORAGE_KEY = "multivrs.domain-cart.v1";
const DomainCommerceContext = createContext<DomainCommerceContextValue | null>(
  null,
);

export function DomainCommerceProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const [cartItem, setCartItem] = useState<DomainSearchResult | null>(null);
  const [savedDomains, setSavedDomains] = useState<DomainSearchResult[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    setCartItem(parseStoredDomain(localStorage.getItem(CART_STORAGE_KEY)));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!userId) {
      setSavedDomains([]);
      setSavedOpen(false);
      return;
    }
    const controller = new AbortController();
    async function loadSavedDomains() {
      try {
        const response = await fetch("/api/domains/saved", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load saved domains");
        const body: unknown = await response.json();
        const domains =
          typeof body === "object" && body && "domains" in body
            ? body.domains
            : undefined;
        const parsed = savedDomainsSchema.safeParse(domains);
        if (parsed.success) setSavedDomains(parsed.data);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSavedDomains([]);
        }
      }
    }
    void loadSavedDomains();
    return () => controller.abort();
  }, [userId]);

  const value = useMemo<DomainCommerceContextValue>(
    () => ({
      cartItem,
      savedDomains,
      isSignedIn: Boolean(userId),
      hydrated,
      cartOpen,
      savedOpen,
      addToCart: (result) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(result));
        setCartItem(result);
        setCartOpen(true);
      },
      removeFromCart: () => {
        localStorage.removeItem(CART_STORAGE_KEY);
        setCartItem(null);
      },
      setCartOpen,
      setSavedOpen,
      toggleSaved: async (result) => {
        if (!userId) return;
        const exists = savedDomains.some(
          (item) => item.domain === result.domain,
        );
        const previous = savedDomains;
        setSavedDomains(
          exists
            ? previous.filter((item) => item.domain !== result.domain)
            : [result, ...previous],
        );
        const response = await fetch("/api/domains/saved", {
          method: exists ? "DELETE" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(exists ? { hostname: result.domain } : result),
        });
        if (!response.ok) {
          setSavedDomains(previous);
          throw new Error("Unable to update saved domains");
        }
      },
      isSaved: (domain) => savedDomains.some((item) => item.domain === domain),
    }),
    [cartItem, savedDomains, userId, hydrated, cartOpen, savedOpen],
  );

  return (
    <DomainCommerceContext.Provider value={value}>
      {children}
    </DomainCommerceContext.Provider>
  );
}

export function useDomainCommerce(): DomainCommerceContextValue {
  const context = useContext(DomainCommerceContext);
  if (!context) {
    throw new Error("useDomainCommerce requires DomainCommerceProvider");
  }
  return context;
}
