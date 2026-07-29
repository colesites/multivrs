"use client";

import { Suspense, use } from "react";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import type { DashboardNotification } from "@/features/dashboard/types/notification.types";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarMailNav } from "./SidebarMailNav";
import { SidebarNav } from "./SidebarNav";
import { SidebarObservabilityNav } from "./SidebarObservabilityNav";
import { SidebarSearch } from "./SidebarSearch";

export interface SidebarProps {
  user: { name: string; email: string; image?: string | null };
  workspaceName?: string;
  plan?: string;
  notifications: Promise<DashboardNotification[]>;
}

export function Sidebar({
  user,
  workspaceName,
  plan,
  notifications,
}: SidebarProps) {
  const { activeSlug } = useDashboardScope();
  const isEmails = activeSlug === "emails" || activeSlug === "email";
  const isObservability = activeSlug === "observability";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-[var(--hairline)] bg-[var(--ink)] lg:flex">
      <SidebarHeader
        displayName={workspaceName}
        image={user.image}
        plan={plan}
      />
      {isEmails ? (
        <SidebarMailNav />
      ) : isObservability ? (
        <SidebarObservabilityNav />
      ) : (
        <>
          <div className="px-3 pb-1 pt-3">
            <SidebarSearch />
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
            <SidebarNav />
          </div>
        </>
      )}
      <Suspense
        fallback={
          <SidebarFooter
            name={user.name}
            email={user.email}
            image={user.image}
            notifications={[]}
          />
        }
      >
        <SidebarFooterData notifications={notifications} user={user} />
      </Suspense>
    </aside>
  );
}

function SidebarFooterData({
  notifications,
  user,
}: Pick<SidebarProps, "notifications" | "user">) {
  return <SidebarFooter {...user} notifications={use(notifications)} />;
}
