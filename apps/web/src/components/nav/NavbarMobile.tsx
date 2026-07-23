"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SpecularButton from "@/components/SpecularButton";
import { authClient } from "@/lib/auth-client";
import { MEGA_MENUS, NAV_LINKS, type NavColumn } from "./navigation";

interface NavbarMobileProps {
  onClose: () => void;
}

export function NavbarMobile({ onClose }: NavbarMobileProps) {
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
  };

  return (
    <div className="fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-xl md:hidden">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col p-6">
        <div className="space-y-1">
          {MEGA_MENUS.map((menu) => {
            const isOpen = openMenu === menu.label;
            return (
              <div key={menu.label} className="border-b border-white/5 pb-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleMenu(menu.label)}
                  className="flex w-full items-center justify-between py-3 text-left text-xl font-medium text-white/90 transition-colors hover:text-white"
                  aria-expanded={isOpen}
                >
                  <span>{menu.label}</span>
                  <ChevronDown
                    className={`size-5 text-white/50 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-2 space-y-6 pl-2 pb-4 pt-1">
                    {menu.columns.map((column) => (
                      <MobileColumn
                        key={column.heading}
                        column={column}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {NAV_LINKS.map((link) => (
            <div key={link.label} className="border-b border-white/5 pb-2 pt-1">
              <Link
                href={link.href}
                className="flex items-center py-3 text-xl font-medium text-white/90 transition-colors hover:text-white"
                onClick={onClose}
              >
                {link.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {isSignedIn ? (
            <Link href="/dashboard" onClick={onClose} className="w-full">
              <SpecularButton
                size="md"
                radius={10}
                tint="#ffffff"
                tintOpacity={0.95}
                baseColor="#ffffff"
                lineColor="#ffffff"
                textColor="#000000"
                className="w-full"
              >
                Dashboard
              </SpecularButton>
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="w-full">
                <SpecularButton
                  size="md"
                  radius={10}
                  tint="#ffffff"
                  tintOpacity={0.05}
                  baseColor="#333333"
                  lineColor="#ffffff"
                  textColor="#ffffff"
                  className="w-full"
                >
                  Log In
                </SpecularButton>
              </Link>
              <Link href="/signup" onClick={onClose} className="w-full">
                <SpecularButton
                  size="md"
                  radius={10}
                  tint="#ffffff"
                  tintOpacity={0.95}
                  baseColor="#ffffff"
                  lineColor="#ffffff"
                  textColor="#000000"
                  className="w-full"
                >
                  Sign Up
                </SpecularButton>
              </Link>
            </>
          )}
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
