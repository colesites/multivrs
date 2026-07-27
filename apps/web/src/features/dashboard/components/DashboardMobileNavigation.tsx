"use client";

import { Menu } from "lucide-react";
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
import { SidebarSearch } from "@/features/dashboard/components/SidebarSearch";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";

export function DashboardMobileNavigation({
  notifications,
  user,
  workspaceName,
}: {
  notifications: DashboardNotification[];
  user: { email: string; image?: string | null; name: string };
  workspaceName: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-[290px] flex-col gap-0 border-r border-[var(--hairline)] bg-[var(--ink)] p-0 dashboard-surface"
      >
        <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
        <SidebarHeader displayName={workspaceName} image={user.image} />
        <div className="px-3 pb-1 pt-3">
          <SidebarSearch />
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <SidebarFooter
          email={user.email}
          image={user.image}
          name={user.name}
          notifications={notifications}
        />
      </SheetContent>
    </Sheet>
  );
}
