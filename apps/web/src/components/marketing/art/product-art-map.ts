import type { ComponentType } from "react";
import {
  DomainsArt,
  EmailArt,
  KontinueArt,
  SwiftRustArt,
  SwiftRustUiArt,
} from "@/components/marketing/art/product-art";
import type { ProductArtKey } from "@/lib/marketing/products";

export const PRODUCT_ART: Record<
  ProductArtKey,
  ComponentType<{ className?: string }>
> = {
  "swift-rust": SwiftRustArt,
  "swift-rust-ui": SwiftRustUiArt,
  domains: DomainsArt,
  email: EmailArt,
  kontinue: KontinueArt,
};
