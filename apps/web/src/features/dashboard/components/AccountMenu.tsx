"use client";

import {
  BookOpen,
  Home,
  LifeBuoy,
  LogOut,
  PenLine,
  Settings,
  SmilePlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "./ThemeToggle";

interface AccountMenuProps {
  name: string;
  email: string;
}

const LINKS = [
  { label: "Home Page", href: "/", icon: Home },
  { label: "Changelog", href: "/shipped", icon: PenLine },
  { label: "Help", href: "/help", icon: LifeBuoy },
  { label: "Docs", href: "/docs", icon: BookOpen },
] as const;

export function AccountMenu({ name, email }: AccountMenuProps) {
  const router = useRouter();
  const { username, scope } = useDashboardScope();
  const settingsHref = buildNavHref(username, scope, "settings");

  const logOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") },
    });
  };

  return (
    <div className="text-[14px]">
      <div className="flex items-start justify-between gap-3 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{name}</p>
          <p className="truncate text-[12px] text-muted-foreground">{email}</p>
        </div>
        <Link
          href={settingsHref}
          className="shrink-0 rounded-md p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
          aria-label="Account settings"
        >
          <Settings className="size-4" strokeWidth={1.75} />
        </Link>
      </div>

      <DropdownMenuSeparator />

      <DropdownMenuItem className="rounded-lg">
        <SmilePlus className="text-muted-foreground" strokeWidth={1.75} />
        Feedback
      </DropdownMenuItem>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="font-medium">Theme</span>
        <ThemeToggle />
      </div>

      {LINKS.map(({ label, href, icon: Icon }) => (
        <DropdownMenuItem key={label} className="rounded-lg" asChild>
          <Link href={href}>
            <Icon className="text-muted-foreground" strokeWidth={1.75} />
            {label}
          </Link>
        </DropdownMenuItem>
      ))}

      <DropdownMenuItem className="rounded-lg" onClick={logOut}>
        <LogOut className="text-muted-foreground" strokeWidth={1.75} />
        Log Out
      </DropdownMenuItem>

      <div className="px-1.5 pt-1.5">
        <Button className="w-full rounded-xl" size="lg">
          Upgrade to Pro
        </Button>
      </div>

      <DropdownMenuSeparator />

      <div className="flex items-center justify-between px-3 py-1.5">
        <div>
          <p className="text-[12px] text-muted-foreground">Platform Status</p>
          <p className="text-[13px] text-[var(--accent)]">
            All systems normal.
          </p>
        </div>
        <span className="size-2 rounded-full bg-[var(--accent)]" />
      </div>
    </div>
  );
}
