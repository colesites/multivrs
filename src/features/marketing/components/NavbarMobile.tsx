"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRODUCTS, RESOURCES, NAV_LINKS } from "@/features/marketing/constants/navigation";

interface NavbarMobileProps {
  onClose: () => void;
}

export function NavbarMobile({ onClose }: NavbarMobileProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex flex-col h-full p-6 overflow-y-auto">
        <div className="mb-8">
          <h3 className="mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase">Products</h3>
          <ul className="grid gap-2">
            {PRODUCTS.map((product) => (
              <li key={product.title}>
                <Link
                  href={product.href}
                  className="flex items-center gap-3 rounded-lg p-2 text-sm text-white/60 active:bg-white/5 active:text-white"
                  onClick={onClose}
                >
                  <product.icon className="size-4" />
                  {product.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase">Resources</h3>
          <ul className="grid gap-2">
            {RESOURCES.map((resource) => (
              <li key={resource.title}>
                <Link
                  href={resource.href}
                  className="flex items-center gap-3 rounded-lg p-2 text-sm text-white/60 active:bg-white/5 active:text-white"
                  onClick={onClose}
                >
                  <resource.icon className="size-4" />
                  {resource.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8 border-t border-white/5 pt-8">
          <ul className="grid gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-lg font-medium text-white/80"
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button
            className="w-full rounded-full bg-white text-black"
            onClick={onClose}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
