"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { PRODUCTS, RESOURCES, NAV_LINKS } from "@/features/marketing/constants/navigation";
import { NavbarListItem } from "./NavbarListItem";

export function NavbarDesktop() {
  return (
    <div className="hidden md:flex items-center w-full justify-between ml-8">
      <NavigationMenu>
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white/60 hover:bg-white/5 hover:text-white data-[state=open]:text-white">
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {PRODUCTS.map((product) => (
                  <NavbarListItem
                    key={product.title}
                    title={product.title}
                    href={product.href}
                    icon={product.icon}
                  >
                    {product.description}
                  </NavbarListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-white/60 hover:bg-white/5 hover:text-white data-[state=open]:text-white">
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {RESOURCES.map((resource) => (
                  <NavbarListItem
                    key={resource.title}
                    title={resource.title}
                    href={resource.href}
                    icon={resource.icon}
                  >
                    {resource.description}
                  </NavbarListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {NAV_LINKS.map((link) => (
            <NavigationMenuItem key={link.label}>
              <Link href={link.href} legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "bg-transparent text-white/60 hover:bg-white/5 hover:text-white")}>
                  {link.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          Sign in
        </Link>
        <Button
          size="sm"
          className="rounded-full bg-white px-5 text-xs font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          Start free
          <ArrowUpRight className="ml-1.5 size-3.5" />
        </Button>
      </div>
    </div>
  );
}
