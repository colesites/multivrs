/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronDown, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { NotificationDropdown } from "./NotificationDropdown";

export function Header() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name || "User";

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Format pathname into a readable title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    const pathParts = pathname.split("/");
    const lastPart = pathParts[pathParts.length - 1] ?? "";
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
          <Search className="absolute left-4 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors z-10" />
          <Input
            type="text"
            placeholder="Search resources..."
            className="w-80 pl-11 pr-4 py-3 text-[13px]"
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
          <Button
            variant="ghost"
            className="flex items-center gap-3 h-auto py-1.5 pl-1.5 pr-4 rounded-2xl border border-transparent hover:border-border group"
          >
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-border shadow-md bg-accent flex items-center justify-center">
              <span className="text-foreground font-bold text-sm">
                {getInitials(userName)}
              </span>
            </div>
            <div className="hidden flex-col items-start text-sm sm:flex">
              <span className="font-bold text-foreground text-[13px]">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                Free
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </div>
      </div>
    </header>
  );
}
