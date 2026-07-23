import type { DomainSearchResult } from "@/features/domains/domain-marketplace";

export interface DomainCommerceContextValue {
  cartItem: DomainSearchResult | null;
  savedDomains: DomainSearchResult[];
  isSignedIn: boolean;
  hydrated: boolean;
  cartOpen: boolean;
  savedOpen: boolean;
  addToCart: (result: DomainSearchResult) => void;
  removeFromCart: () => void;
  setCartOpen: (open: boolean) => void;
  setSavedOpen: (open: boolean) => void;
  toggleSaved: (result: DomainSearchResult) => Promise<void>;
  isSaved: (domain: string) => boolean;
}
