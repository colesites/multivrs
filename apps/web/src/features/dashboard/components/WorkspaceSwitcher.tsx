"use client";

import { Check, ChevronsUpDown, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ALL_PROJECTS_SCOPE,
  buildNavHref,
} from "@/features/dashboard/constants/navigation";
import type {
  CurrentWorkspace,
  DashboardWorkspace,
} from "@/features/dashboard/types/workspace.types";
import type { PlanKey } from "@/lib/payments/billing.types";

const PLAN_LABELS: Record<PlanKey, string> = {
  hobby: "Hobby",
  pro: "Pro",
  enterprise: "Enterprise",
};

interface WorkspaceSwitcherProps {
  workspace: CurrentWorkspace;
  /** Your own account first, then teams you're on. */
  workspaces: DashboardWorkspace[];
}

/** Sidebar header: the account being viewed, and a menu to open another. */
export function WorkspaceSwitcher({
  workspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const own = workspaces.find((item) => !item.role);
  const teams = workspaces.filter((item) => item.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch workspace"
        className="flex h-12 w-full items-center gap-2.5 rounded-lg px-2 text-left outline-none transition-colors hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-(--hairline-strong) data-[state=open]:bg-white/[0.04]"
      >
        <WorkspaceAvatar workspace={workspace} size={32} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-foreground">
            {workspace.username}
          </span>
          <span className="truncate font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            {workspace.plan ? PLAN_LABELS[workspace.plan] : " "}
          </span>
        </span>
        <ChevronsUpDown
          className="size-3.5 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-62 rounded-2xl border border-(--hairline) bg-(--ink) p-1.5 font-hanken shadow-2xl shadow-black/40 dashboard-surface"
      >
        {own && (
          <>
            <MenuLabel>Your account</MenuLabel>
            <WorkspaceItem
              item={own}
              detail="Personal"
              active={own.username === workspace.username}
            />
          </>
        )}
        {teams.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <MenuLabel>Teams you're on</MenuLabel>
            {teams.map((team) => (
              <WorkspaceItem
                key={team.username}
                item={team}
                detail={team.role}
                active={team.username === workspace.username}
              />
            ))}
          </>
        )}
        {own && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg" asChild>
              <Link
                href={`${buildNavHref(own.username, ALL_PROJECTS_SCOPE, "settings")}#team`}
              >
                <Users className="text-muted-foreground" strokeWidth={1.75} />
                Manage your team
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenuLabel className="px-3 pt-2 pb-1 font-geist-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </DropdownMenuLabel>
  );
}

function WorkspaceItem({
  item,
  detail,
  active,
}: {
  item: DashboardWorkspace;
  detail?: string;
  active: boolean;
}) {
  return (
    <DropdownMenuItem className="rounded-lg" asChild>
      <Link
        href={`/${item.username}`}
        aria-current={active ? "page" : undefined}
      >
        <WorkspaceAvatar workspace={item} size={24} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] text-foreground">
            {item.username}
          </span>
          {detail && (
            <span className="truncate text-[11px] font-normal capitalize text-muted-foreground">
              {detail}
            </span>
          )}
        </span>
        {active && <Check className="text-foreground" strokeWidth={2} />}
      </Link>
    </DropdownMenuItem>
  );
}

function WorkspaceAvatar({
  workspace,
  size,
}: {
  workspace: DashboardWorkspace;
  size: number;
}) {
  const style = { width: size, height: size };
  if (workspace.image) {
    return (
      <Image
        src={workspace.image}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={style}
        className="shrink-0 rounded-md border border-(--hairline-strong) object-cover"
      />
    );
  }
  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-md border border-(--hairline-strong) bg-white/[0.04] font-geist-mono text-[12px] font-medium text-foreground"
    >
      {(workspace.username[0] ?? "M").toUpperCase()}
    </span>
  );
}
