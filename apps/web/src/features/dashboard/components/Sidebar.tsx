import { SidebarFooter } from "./SidebarFooter";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarSearch } from "./SidebarSearch";

export interface SidebarProps {
  user: { name: string; email: string; image?: string | null };
  workspaceName?: string;
  plan?: string;
}

export function Sidebar({ user, workspaceName, plan }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-[var(--hairline)] bg-[var(--ink)]">
      <SidebarHeader
        displayName={workspaceName}
        image={user.image}
        plan={plan}
      />
      <div className="px-3 pb-1 pt-3">
        <SidebarSearch />
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        <SidebarNav />
      </div>
      <SidebarFooter name={user.name} email={user.email} image={user.image} />
    </aside>
  );
}
