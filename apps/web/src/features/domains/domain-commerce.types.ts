import type { DomainSearchResult } from "@/features/domains/domain-marketplace";

export interface DomainCommerceContextValue {
  cartItems: DomainSearchResult[];
  savedDomains: DomainSearchResult[];
  isSignedIn: boolean;
  hydrated: boolean;
  cartOpen: boolean;
  savedOpen: boolean;
  addToCart: (result: DomainSearchResult) => void;
  removeFromCart: (domain: string) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setSavedOpen: (open: boolean) => void;
  toggleSaved: (result: DomainSearchResult) => Promise<void>;
  toggleCart: (result: DomainSearchResult) => void;
  moveSavedToCart: (result: DomainSearchResult) => Promise<void>;
  moveCartToSaved: (result: DomainSearchResult) => Promise<void>;
  isInCart: (domain: string) => boolean;
  isSaved: (domain: string) => boolean;
}
