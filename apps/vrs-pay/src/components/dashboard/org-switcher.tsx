import {
  Check,
  ChevronsUpDown,
  FlaskConical,
  LogOut,
  Plus,
  Radio,
  Settings,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "./api";
import { useApi, useDashboard } from "./context";
import { NewOrganizationDialog } from "./new-organization";
import type { List, Organization } from "./types";
import { Button } from "./ui";

/** "Ada Studio" → "AS". */
export function Initials({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
      {letters || "?"}
    </span>
  );
}

/** Loaded when the menu opens. */
function Organizations() {
  const { session, switchTo } = useDashboard();
  const { data } = useApi<List<Organization>>("/organizations");
  return (
    <>
      {(data?.data ?? []).map((org) => (
        <DropdownMenuItem
          key={org.id}
          onClick={() =>
            org.id !== session.merchant.id &&
            switchTo({ merchant: org.id, mode: "test" })
          }
        >
          <Initials name={org.name} />
          <span className="min-w-0 flex-1 truncate">{org.name}</span>
          {org.id === session.merchant.id && (
            <Check className="size-4 text-brand-600" />
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}

/** Test ⇄ live. Live opens once setup is finished. */
function ModeItem() {
  const { session, switchTo, navigate } = useDashboard();
  if (session.mode === "live") {
    return (
      <DropdownMenuItem onClick={() => switchTo({ mode: "test" })}>
        <FlaskConical className="size-4" /> Switch to test mode
      </DropdownMenuItem>
    );
  }
  return session.live_unlocked ? (
    <DropdownMenuItem onClick={() => switchTo({ mode: "live" })}>
      <Radio className="size-4 text-emerald-600" /> Switch to live mode
    </DropdownMenuItem>
  ) : (
    <DropdownMenuItem onClick={() => navigate("setup")} className="text-mute">
      <Radio className="size-4" /> Go live: finish setup first
    </DropdownMenuItem>
  );
}

/** The sidebar footer: your businesses, test/live, settings and sign out. */
export function OrgSwitcher({ opensUp = true }: { opensUp?: boolean }) {
  const { apiUrl, session, navigate } = useDashboard();
  const [creating, setCreating] = useState(false);
  return (
    <>
      <DropdownMenu className="block w-full">
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-2.5 p-2 text-left"
          >
            <Initials name={session.merchant.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                {session.merchant.name}
              </span>
              <span className="block truncate text-xs text-mute">
                {session.user.email}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-mute" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={`w-full ${opensUp ? "bottom-full mt-0 mb-2" : ""}`}
        >
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <Organizations />
          <DropdownMenuItem onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New organization
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ModeItem />
          <DropdownMenuItem onClick={() => navigate("settings")}>
            <Settings className="size-4" /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut(apiUrl)}>
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewOrganizationDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
