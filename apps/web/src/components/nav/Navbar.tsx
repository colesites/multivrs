"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MultivrsMark } from "@/components/brand/Logo";
import { useDomainCommerce } from "@/features/domains/DomainCommerceProvider";
import { cn } from "@/lib/utils";
import { DesktopNavbarActions, MobileNavbarActions } from "./NavbarActions";
import { NavbarMobile } from "./NavbarMobile";
import {
  MEGA_MENUS,
  type MegaMenuLabel,
  NAV_LINKS,
  type NavColumn,
} from "./navigation";

function isDarkMarketingHeaderVisible() {
  const darkSection = document.getElementById("dark-marketing-header");
  return darkSection ? darkSection.getBoundingClientRect().bottom > 64 : false;
}

export function Navbar() {
  const pathname = usePathname();
  const { cartItems, savedDomains, isSignedIn, setCartOpen, setSavedOpen } =
    useDomainCommerce();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOverDarkSection, setIsOverDarkSection] = useState(false);
  // Which mega-menu is expanded (null = closed). Shared by triggers + panel.
  const [activeMenu, setActiveMenu] = useState<MegaMenuLabel | null>(null);

  useEffect(() => {
    const checkDarkSection = () =>
      setIsOverDarkSection(isDarkMarketingHeaderVisible());
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      checkDarkSection();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", checkDarkSection, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", checkDarkSection);
    };
  }, []);

  // Re-check section when pathname changes (since Navbar doesn't unmount)
  useEffect(() => {
    if (pathname) {
      const checkDarkSection = () =>
        setIsOverDarkSection(isDarkMarketingHeaderVisible());
      const frame = requestAnimationFrame(checkDarkSection);
      const timeout = setTimeout(checkDarkSection, 100);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timeout);
      };
    }
  }, [pathname]);

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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: collapsing mega menu on mouse leave */}
      <header
        // Leaving the whole header (bar + panel) collapses the menu.
        onMouseLeave={() => setActiveMenu(null)}
        className={cn(
          "fixed top-0 right-0 left-0 z-50",
          scrolled || isOpen || mobileOpen
            ? "bg-background/95 backdrop-blur-xl"
            : "bg-transparent",
          isOverDarkSection && !mobileOpen && "dark text-foreground",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <Link
              href="/home"
              className="flex items-center gap-2 text-foreground"
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
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <DesktopNavbarActions
            cartCount={cartItems.length}
            isOverDarkSection={isOverDarkSection}
            isSignedIn={isSignedIn}
            mobileOpen={mobileOpen}
            onCartOpen={() => setCartOpen(true)}
            onMobileToggle={() => setMobileOpen((value) => !value)}
            onSavedOpen={() => setSavedOpen(true)}
            pathname={pathname}
            savedCount={savedDomains.length}
          />

          <MobileNavbarActions
            cartCount={cartItems.length}
            isOverDarkSection={isOverDarkSection}
            isSignedIn={isSignedIn}
            mobileOpen={mobileOpen}
            onCartOpen={() => setCartOpen(true)}
            onMobileToggle={() => setMobileOpen((value) => !value)}
            onSavedOpen={() => setSavedOpen(true)}
            pathname={pathname}
            savedCount={savedDomains.length}
          />
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
      <p className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
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
              className="group inline-flex items-center gap-1 text-base text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.title}
              {link.external && (
                <ArrowUpRight className="size-3.5 text-foreground/40 transition-colors group-hover:text-foreground" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
