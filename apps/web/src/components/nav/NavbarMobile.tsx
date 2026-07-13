"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MEGA_MENUS, NAV_LINKS, type NavColumn } from "./navigation";

interface NavbarMobileProps {
  onClose: () => void;
}

export function NavbarMobile({ onClose }: NavbarMobileProps) {
  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex min-h-full flex-col p-6">
        {MEGA_MENUS.map((menu) => (
          <div key={menu.label} className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-white/80">
              {menu.label}
            </h3>
            <div className="space-y-6">
              {menu.columns.map((column) => (
                <MobileColumn
                  key={column.heading}
                  column={column}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mb-8 border-t border-white/5 pt-8">
          <ul className="grid gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-lg font-medium text-white/80"
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button
            render={<Link href="/login" onClick={onClose} />}
            nativeButton={false}
            variant="outline"
            className="w-full rounded-full"
          >
            Sign in
          </Button>
          <Button
            render={<Link href="/signup" onClick={onClose} />}
            nativeButton={false}
            className="w-full rounded-full bg-white text-black"
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileColumn({
  column,
  onClose,
}: {
  column: NavColumn;
  onClose: () => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-widest text-white/40 uppercase">
        {column.heading}
      </p>
      <ul className="grid gap-1">
        {column.links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              onClick={onClose}
              className="flex items-center gap-1 rounded-lg py-1.5 text-sm text-white/70 active:text-white"
            >
              {link.title}
              {link.external && (
                <ArrowUpRight className="size-3.5 text-white/40" />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
