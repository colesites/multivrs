/* eslint-disable @next/next/no-img-element */
"use client";

import { usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { mockUser } from "@/lib/mock";
import { NotificationDropdown } from "./NotificationDropdown";

export function Header() {
  const pathname = usePathname();

  // Format pathname into a readable title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border bg-background/60 px-8 py-4 backdrop-blur-xl shadow-sm">
      {/* Page Title & Breadcrumb feel */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60 mb-0.5">
           <span>Multivrs</span>
           <span className="opacity-20">/</span>
           <span className="text-muted-foreground">{getPageTitle()}</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Search Bar - stylized like Stakent command bar */}
        <div className="relative group flex items-center">
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <input
            type="text"
            placeholder="Search resources..."
            className="h-11 w-80 rounded-2xl border border-border bg-muted/20 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-border/80 focus:bg-muted/40 focus:outline-none transition-all shadow-inner"
          />
          <div className="absolute right-4 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-lg border border-border bg-background px-2 font-mono text-[10px] font-bold text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <NotificationDropdown />

          <div className="h-8 w-px bg-border/40" />

          {/* Profile Dropdown Trigger */}
          <button className="flex items-center gap-3 hover:bg-muted/40 rounded-2xl p-1.5 pr-4 transition-all border border-transparent hover:border-border group">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden border border-border shadow-md">
              <img
                src={mockUser.avatar}
                alt={mockUser.name}
                className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <div className="hidden flex-col items-start text-sm sm:flex">
              <span className="font-bold text-foreground text-[13px]">{mockUser.name}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">{mockUser.plan}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}

