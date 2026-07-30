"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";
import { authClient } from "@/lib/auth-client";
import {
  parseStoredCart,
  readDomainApiError,
  savedDomainsSchema,
} from "./domain-commerce.schemas";
import type { DomainCommerceContextValue } from "./domain-commerce.types";
import type { DomainSearchResult } from "./domain-marketplace";

const CART_STORAGE_KEY = "multivrs.domain-cart.v1";
const EMPTY_DOMAINS: DomainSearchResult[] = [];
const DomainCommerceContext = createContext<DomainCommerceContextValue | null>(
  null,
);

async function fetchSavedDomains() {
  const response = await fetch("/api/domains/saved", {
    cache: "no-store",
    credentials: "same-origin",
  });
  if (!response.ok) return EMPTY_DOMAINS;
  const body: unknown = await response.json();
  const domains =
    typeof body === "object" && body && "domains" in body
      ? body.domains
      : undefined;
  const parsed = savedDomainsSchema.safeParse(domains);
  return parsed.success ? parsed.data : EMPTY_DOMAINS;
}

export function DomainCommerceProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession();
  const userId = session?.user.id;
  const [cartItems, setCartItems] = useState<DomainSearchResult[]>([]);
  const { data: savedDomains = EMPTY_DOMAINS, mutate: mutateSavedDomains } =
    useSWR(userId ? "/api/domains/saved" : null, fetchSavedDomains);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCartItems(parseStoredCart(localStorage.getItem(CART_STORAGE_KEY)));
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const visibleSavedDomains = userId ? savedDomains : EMPTY_DOMAINS;
  const visibleSavedOpen = Boolean(userId) && savedOpen;
  const setSavedDomains = (domains: DomainSearchResult[]) => {
    void mutateSavedDomains(domains, { revalidate: false });
  };

  const value: DomainCommerceContextValue = {
    cartItems,
    savedDomains: visibleSavedDomains,
    isSignedIn: Boolean(userId),
    hydrated,
    cartOpen,
    savedOpen: visibleSavedOpen,
    addToCart: (result) => {
      const next = [
        ...cartItems.filter((item) => item.domain !== result.domain),
        result,
      ];
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      setCartItems(next);
      setCartOpen(true);
    },
    removeFromCart: (domain) => {
      const next = cartItems.filter((item) => item.domain !== domain);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      setCartItems(next);
    },
    clearCart: () => {
      localStorage.removeItem(CART_STORAGE_KEY);
      setCartItems([]);
    },
    toggleCart: (result) => {
      const exists = cartItems.some((item) => item.domain === result.domain);
      const next = exists
        ? cartItems.filter((item) => item.domain !== result.domain)
        : [...cartItems, result];
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
      setCartItems(next);
      if (!exists) setCartOpen(true);
    },
    moveSavedToCart: async (result) => {
      if (!userId) return;
      const previousSaved = savedDomains;
      const previousCart = cartItems;
      const nextCart = [
        ...cartItems.filter((item) => item.domain !== result.domain),
        result,
      ];
      setSavedDomains(
        savedDomains.filter((item) => item.domain !== result.domain),
      );
      setCartItems(nextCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      const response = await fetch("/api/domains/saved", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ hostname: result.domain }),
      });
      if (!response.ok) {
        setSavedDomains(previousSaved);
        setCartItems(previousCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(previousCart));
        const body: unknown = await response.json().catch(() => null);
        throw new Error(readDomainApiError(body));
      }
      setSavedOpen(false);
      setCartOpen(true);
    },
    moveCartToSaved: async (result) => {
      if (!userId) return;
      const previousSaved = savedDomains;
      const previousCart = cartItems;
      const nextCart = cartItems.filter(
        (item) => item.domain !== result.domain,
      );
      setSavedDomains([
        result,
        ...savedDomains.filter((item) => item.domain !== result.domain),
      ]);
      setCartItems(nextCart);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      const response = await fetch("/api/domains/saved", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(result),
      });
      if (!response.ok) {
        setSavedDomains(previousSaved);
        setCartItems(previousCart);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(previousCart));
        const body: unknown = await response.json().catch(() => null);
        throw new Error(readDomainApiError(body));
      }
    },
    setCartOpen,
    setSavedOpen,
    toggleSaved: async (result) => {
      if (!userId) return;
      const exists = savedDomains.some((item) => item.domain === result.domain);
      const previous = savedDomains;
      setSavedDomains(
        exists
          ? previous.filter((item) => item.domain !== result.domain)
          : [result, ...previous],
      );
      const response = await fetch("/api/domains/saved", {
        method: exists ? "DELETE" : "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(exists ? { hostname: result.domain } : result),
      });
      if (!response.ok) {
        setSavedDomains(previous);
        const body: unknown = await response.json().catch(() => null);
        throw new Error(readDomainApiError(body));
      }
    },
    isInCart: (domain) => cartItems.some((item) => item.domain === domain),
    isSaved: (domain) => savedDomains.some((item) => item.domain === domain),
  };

  return (
    <DomainCommerceContext.Provider value={value}>
      {children}
    </DomainCommerceContext.Provider>
  );
}

export function useDomainCommerce(): DomainCommerceContextValue {
  const context = useContext(DomainCommerceContext);
  if (!context)
    throw new Error("useDomainCommerce requires DomainCommerceProvider");
  return context;
}
