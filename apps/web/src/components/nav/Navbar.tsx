"use client";

import { ArrowUpRight, Bookmark, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MultivrsMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavbarMobile } from "./NavbarMobile";
import {
  MEGA_MENUS,
  type MegaMenuLabel,
  NAV_LINKS,
  type NavColumn,
} from "./navigation";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which mega-menu is expanded (null = closed). Shared by triggers + panel.
  const [activeMenu, setActiveMenu] = useState<MegaMenuLabel | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isOpen = activeMenu !== null;
  const activeColumns =
    MEGA_MENUS.find((m) => m.label === activeMenu)?.columns ?? [];

  return (
    <>
      <header
        // Leaving the whole header (bar + panel) collapses the menu.
        onMouseLeave={() => setActiveMenu(null)}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 transition-colors duration-300",
          scrolled || isOpen
            ? "bg-background/95 backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-white"
              onMouseEnter={() => setActiveMenu(null)}
            >
              <MultivrsMark className="size-6" />
              <span className="font-clash text-lg font-bold tracking-wider">
                MULTIVRS
              </span>
            </Link>

            {/* Desktop triggers */}
            <div className="hidden items-center gap-1 md:flex">
              {MEGA_MENUS.map((menu) => (
                <button
                  key={menu.label}
                  type="button"
                  onMouseEnter={() => setActiveMenu(menu.label)}
                  onClick={() =>
                    setActiveMenu((cur) =>
                      cur === menu.label ? null : menu.label,
                    )
                  }
                  aria-expanded={activeMenu === menu.label}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    activeMenu === menu.label
                      ? "text-white"
                      : "text-white/60 hover:text-white",
                  )}
                >
                  {menu.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      activeMenu === menu.label && "rotate-180",
                    )}
                  />
                </button>
              ))}

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onMouseEnter={() => setActiveMenu(null)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop right actions */}
          <div className="hidden items-center gap-3 md:flex">
            {pathname === "/domains" ? (
              <>
                <Button className="h-10 rounded-lg border border-white/15 bg-transparent px-5 text-sm font-medium text-white hover:bg-white/5">
                  <Bookmark className="size-4" /> Saved
                </Button>
                <Button className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black hover:bg-white/90">
                  <ShoppingCart className="size-4" /> Cart
                </Button>
              </>
            ) : (
              <>
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              className="h-10 rounded-lg border border-white/15 bg-transparent px-5 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Log In
            </Button>
            <Button
              render={<Link href="/signup" />}
              nativeButton={false}
              className="h-10 rounded-lg bg-white px-5 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
            >
              Sign Up
            </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-auto text-white/70 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </nav>

        {/* Expanding mega-menu panel (desktop). The grid-rows 0fr→1fr trick
            animates real height with pure CSS, matching Vercel's expand. */}
        <div
          className={cn(
            "hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-out md:grid",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6 pt-2 pb-12 lg:px-10">
              {activeColumns.map((column) => (
                <MegaColumn key={column.heading} column={column} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Dim the page behind an open panel. */}
      <div
        aria-hidden
        onMouseEnter={() => setActiveMenu(null)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {mobileOpen && <NavbarMobile onClose={() => setMobileOpen(false)} />}
    </>
  );
}

function MegaColumn({ column }: { column: NavColumn }) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase">
        {column.heading}
      </p>
      <ul className="space-y-3">
        {column.links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="group inline-flex items-center gap-1 text-base text-white/80 transition-colors hover:text-white"
            >
              {link.title}
              {link.external && (
                <ArrowUpRight className="size-3.5 text-white/40 transition-colors group-hover:text-white" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
