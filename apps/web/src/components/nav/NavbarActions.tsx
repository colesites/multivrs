"use client";

import { Bookmark, Menu, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";

interface NavbarActionProps {
  cartCount: number;
  isOverDarkSection: boolean;
  isSignedIn: boolean;
  mobileOpen: boolean;
  onCartOpen: () => void;
  onMobileToggle: () => void;
  onSavedOpen: () => void;
  pathname: string;
  savedCount: number;
}

const sharedButtonProps = {
  baseColor: "#333333",
  lineColor: "#ffffff",
  radius: 10,
  size: "sm" as const,
  textColor: "currentColor",
  tint: "#ffffff",
  tintOpacity: 0.05,
};

export function DesktopNavbarActions({
  cartCount,
  isOverDarkSection,
  isSignedIn,
  onCartOpen,
  onSavedOpen,
  pathname,
  savedCount,
}: NavbarActionProps) {
  const forceTheme = isOverDarkSection ? "dark" : undefined;
  return (
    <div className="hidden items-center gap-3 md:flex">
      {pathname === "/domains" ? (
        <>
          {isSignedIn ? (
            <SpecularButton
              {...sharedButtonProps}
              forceTheme={forceTheme}
              onClick={onSavedOpen}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Bookmark className="size-4" /> Saved
                <CountBadge count={savedCount} />
              </span>
            </SpecularButton>
          ) : null}
          <SpecularButton
            {...sharedButtonProps}
            forceTheme={forceTheme}
            onClick={onCartOpen}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <ShoppingCart className="size-4" /> Cart
              <CountBadge count={cartCount} />
            </span>
          </SpecularButton>
          {isSignedIn ? null : <AuthButtons forceTheme={forceTheme} />}
        </>
      ) : isSignedIn ? (
        <Link href="/dashboard">
          <SpecularButton {...sharedButtonProps} forceTheme={forceTheme}>
            Dashboard
          </SpecularButton>
        </Link>
      ) : (
        <AuthButtons forceTheme={forceTheme} />
      )}
    </div>
  );
}

export function MobileNavbarActions({
  cartCount,
  isOverDarkSection,
  isSignedIn,
  mobileOpen,
  onCartOpen,
  onMobileToggle,
  onSavedOpen,
  pathname,
  savedCount,
}: NavbarActionProps) {
  const forceTheme = isOverDarkSection && !mobileOpen ? "dark" : undefined;
  return (
    <div className="flex items-center gap-2 md:hidden">
      {pathname === "/domains" ? (
        <>
          {isSignedIn ? (
            <MobileActionButton
              count={savedCount}
              forceTheme={forceTheme}
              icon={Bookmark}
              label="Saved domains"
              onClick={onSavedOpen}
            />
          ) : null}
          <MobileActionButton
            count={cartCount}
            forceTheme={forceTheme}
            icon={ShoppingCart}
            label="Shopping cart"
            onClick={onCartOpen}
          />
        </>
      ) : null}
      <button
        type="button"
        className="ml-1 text-foreground/70"
        onClick={onMobileToggle}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
    </div>
  );
}

function AuthButtons({ forceTheme }: { forceTheme?: "dark" }) {
  return (
    <>
      <Link href="/login">
        <SpecularButton {...sharedButtonProps} forceTheme={forceTheme}>
          Log In
        </SpecularButton>
      </Link>
      <Link href="/signup">
        <SpecularButton
          {...sharedButtonProps}
          baseColor="#ffffff"
          forceTheme={forceTheme}
          textColor="#000000"
          tintOpacity={0.95}
        >
          Sign Up
        </SpecularButton>
      </Link>
    </>
  );
}

function CountBadge({ count }: { count: number }) {
  return count ? (
    <span className="grid size-4 place-items-center rounded-full bg-foreground text-[9px] text-background">
      {count}
    </span>
  ) : null;
}

function MobileActionButton({
  count,
  forceTheme,
  icon: Icon,
  label,
  onClick,
}: {
  count: number;
  forceTheme?: "dark";
  icon: typeof Bookmark;
  label: string;
  onClick: () => void;
}) {
  return (
    <SpecularButton
      {...sharedButtonProps}
      aria-label={label}
      className="px-2.5! py-2!"
      forceTheme={forceTheme}
      onClick={onClick}
    >
      <span className="relative">
        <Icon className="size-4" />
        {count ? (
          <span className="absolute -top-2 -right-2 grid size-4 place-items-center rounded-full bg-blue-500 text-[9px] text-white">
            {count}
          </span>
        ) : null}
      </span>
    </SpecularButton>
  );
}
