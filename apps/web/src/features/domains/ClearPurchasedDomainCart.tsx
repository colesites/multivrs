"use client";

import { useEffect, useRef } from "react";
import { useDomainCommerce } from "@/features/domains/DomainCommerceProvider";

export function ClearPurchasedDomainCart() {
  const { clearCart } = useDomainCommerce();
  const clearCartRef = useRef(clearCart);
  useEffect(() => clearCartRef.current(), []);
  return null;
}
