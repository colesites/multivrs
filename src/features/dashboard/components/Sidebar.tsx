"use client";

import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export function Sidebar() {
  return (
    <aside className="fixed left-4 top-4 bottom-4 z-40 flex w-[280px] flex-col rounded-[32px] border border-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden justify-between">
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden hide-scrollbar">
        <SidebarHeader />
        <SidebarNav />
      </div>
      <SidebarFooter />
    </aside>
  );
}
