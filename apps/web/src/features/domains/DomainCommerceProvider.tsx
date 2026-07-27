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
  parseStoredCart,
  readDomainApiError,
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
  const [cartItems, setCartItems] = useState<DomainSearchResult[]>([]);
  const [savedDomains, setSavedDomains] = useState<DomainSearchResult[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    setCartItems(parseStoredCart(localStorage.getItem(CART_STORAGE_KEY)));
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
          cache: "no-store",
          credentials: "same-origin",
        });
        if (response.ok) {
          const body: unknown = await response.json();
          const domains =
            typeof body === "object" && body && "domains" in body
              ? body.domains
              : undefined;
          const parsed = savedDomainsSchema.safeParse(domains);
          if (parsed.success && !controller.signal.aborted) {
            setSavedDomains(parsed.data);
          }
        } else if (!controller.signal.aborted) {
          setSavedDomains([]);
        }
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
      cartItems,
      savedDomains,
      isSignedIn: Boolean(userId),
      hydrated,
      cartOpen,
      savedOpen,
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
    }),
    [cartItems, savedDomains, userId, hydrated, cartOpen, savedOpen],
  );

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
