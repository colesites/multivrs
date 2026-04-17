"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";

interface NavbarListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
}

export function NavbarListItem({
  className,
  title,
  children,
  icon: Icon,
  href,
}: Omit<NavbarListItemProps, "href"> & { href?: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href || "#"}
          className={cn(
            "group block select-none space-y-1 rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-white/40 group-hover:text-white" />}
            <div className="text-sm font-medium leading-none text-white/90">{title}</div>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-white/40">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
