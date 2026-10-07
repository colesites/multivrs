import { Menu, X } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
} from "@/components/ui/sidebar";
import { useDashboard } from "./context";
import { Mark, VIEWS, type ViewId } from "./nav-items";
import { OrgSwitcher } from "./org-switcher";
import { Button } from "./ui";

interface NavProps {
  view: ViewId;
  onPick: (id: ViewId) => void;
}

function NavLinks({ view, onPick }: NavProps) {
  return (
    <nav className="grid gap-0.5">
      {VIEWS.map(({ id, label, icon: Icon }) => (
        <SidebarItem
          key={id}
          active={view === id}
          onClick={() => onPick(id)}
          aria-current={view === id ? "page" : undefined}
          className="gap-2.5 px-3 py-2"
        >
          <Icon className={view === id ? "text-brand-600" : ""} />
          {label}
        </SidebarItem>
      ))}
    </nav>
  );
}

/** The VRS Pay mark and which mode you're in: test data or real money. */
function Brand() {
  const { session } = useDashboard();
  const live = session.mode === "live";
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Mark />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">
          VRS Pay
        </span>
        <span
          className={`eyebrow block text-[0.6rem] ${live ? "text-emerald-700" : "text-amber-700"}`}
        >
          {live ? "Live mode" : "Test mode"}
        </span>
      </span>
    </div>
  );
}

/** Desktop: a full-height sidebar with your business switcher at the very bottom. */
export function DashboardSidebar({ view, onPick }: NavProps) {
  return (
    <Sidebar className="sticky top-0 hidden h-dvh w-64 gap-4 bg-wash p-3 lg:flex">
      <SidebarHeader className="px-2 pt-2">
        <Brand />
      </SidebarHeader>
      <SidebarContent>
        <NavLinks view={view} onPick={onPick} />
      </SidebarContent>
      <div className="border-t border-line pt-2">
        <OrgSwitcher />
      </div>
    </Sidebar>
  );
}

/** Phones: a top bar with a slide-down menu. */
export function MobileHeader({ view, onPick }: NavProps) {
  const [open, setOpen] = useState(false);
  const pick = (id: ViewId) => {
    setOpen(false);
    onPick(id);
  };
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-wash/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between">
        <Brand />
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>
      {open && (
        <div className="mt-3 grid gap-3">
          <NavLinks view={view} onPick={pick} />
          <div className="border-t border-line pt-2">
            <OrgSwitcher opensUp={false} />
          </div>
        </div>
      )}
    </header>
  );
}
