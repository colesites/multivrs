"use client";

import { Menu } from "lucide-react";
import { Suspense, use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarFooter } from "@/features/dashboard/components/SidebarFooter";
import { SidebarHeader } from "@/features/dashboard/components/SidebarHeader";
import { SidebarNav } from "@/features/dashboard/components/SidebarNav";
import { SidebarObservabilityNav } from "@/features/dashboard/components/SidebarObservabilityNav";
import { SidebarMailNav } from "@/features/dashboard/components/SidebarMailNav";
import { SidebarSearch } from "@/features/dashboard/components/SidebarSearch";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function DashboardMobileNavigation({
  notifications,
  user,
  workspaceName,
}: {
  notifications: Promise<DashboardNotification[]>;
  user: { email: string; image?: string | null; name: string };
  workspaceName: string;
}) {
  const { activeSlug } = useDashboardScope();
  const isEmails = activeSlug === "emails" || activeSlug === "email";
  const isObservability = activeSlug === "observability";
  
  const [open, setOpen] = useState(false);
  const [viewOverride, setViewOverride] = useState<"default" | "emails" | "observability" | null>(null);

  const currentView = viewOverride ?? (isEmails ? "emails" : isObservability ? "observability" : "default");

  return (
    <Sheet open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setTimeout(() => setViewOverride(null), 300);
      }
    }}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-72.5 flex-col gap-0 border-r border-(--hairline) bg-(--ink) p-0 dashboard-surface"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // If a dropdown menu is open in the portal, prevent the sheet from closing.
          // The click outside will only close the dropdown menu itself.
          if (document.querySelector("[data-radix-popper-content-wrapper]")) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (document.querySelector("[data-radix-popper-content-wrapper]")) {
            e.preventDefault();
          }
        }}
      >
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <SidebarHeader displayName={workspaceName} image={user.image} />
        {currentView === "emails" ? (
          <SidebarMailNav onLinkClick={() => setOpen(false)} onBack={() => setViewOverride("default")} />
        ) : currentView === "observability" ? (
          <SidebarObservabilityNav onLinkClick={() => setOpen(false)} onBack={() => setViewOverride("default")} />
        ) : (
          <>
            <div className="px-3 pb-1 pt-3">
              <SidebarSearch />
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav
                onLinkClick={(slug) => {
                  if (slug === "emails" || slug === "email") {
                    setViewOverride("emails");
                  } else if (slug === "observability") {
                    setViewOverride("observability");
                  } else {
                    setOpen(false);
                  }
                }}
              />
            </div>
          </>
        )}
        <Suspense fallback={<SidebarFooter {...user} notifications={[]} />}>
          <MobileSidebarFooter notifications={notifications} user={user} />
        </Suspense>
      </SheetContent>
    </Sheet>
  );
}

function MobileSidebarFooter({
  notifications,
  user,
}: {
  notifications: Promise<DashboardNotification[]>;
  user: { email: string; image?: string | null; name: string };
}) {
  return <SidebarFooter {...user} notifications={use(notifications)} />;
}
