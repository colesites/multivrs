"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Transparent floating navbar that gains backdrop-blur on scroll.
 * Inspired by fundamental.bg's clean navigation.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/5 bg-background/70 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="font-clash text-lg font-bold tracking-wider text-white"
        >
          MULTIVRS
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Button
          size="sm"
          className="hidden rounded-full bg-white/6 px-5 text-xs font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white md:inline-flex"
          variant="ghost"
        >
          Start a project
          <ArrowUpRight className="ml-1.5 size-3.5" />
        </Button>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="text-white/70 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1 p-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
