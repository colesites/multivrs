"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import SpecularButton from "@/components/SpecularButton";
import { authClient } from "@/lib/auth-client";

/**
 * Static marketplace header. It depends on no fetched data, so it renders
 * outside the page's Suspense boundary and never shows a placeholder. The one
 * variable is the call to action, which points sellers at their own dashboard.
 */
export function TemplatesHero() {
  const { data: session } = authClient.useSession();
  const username = session?.user?.username;
  const signedIn = Boolean(session?.user);

  return (
    <section className="border-b border-white/10 px-6 pt-24 pb-12 sm:pt-28 sm:pb-14">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-clash text-5xl leading-[0.96] font-semibold tracking-normal sm:text-6xl">
          Build faster with templates.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
          Start with a solid foundation. Find the right template for your next
          product, or publish your own and earn from every sale.
        </p>
        <Link
          className="mt-8 inline-block"
          href={
            username ? `/${username}/~/templates` : signedIn ? "/" : "/signup"
          }
        >
          <SpecularButton
            baseColor="#ffffff"
            className="group"
            forceTheme="dark"
            lineColor="#ffffff"
            radius={9999}
            size="md"
            textColor="#000000"
            tint="#ffffff"
            tintOpacity={0.95}
          >
            <span className="flex items-center gap-2 font-semibold text-sm">
              {signedIn ? "Your templates" : "Become a seller"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </SpecularButton>
        </Link>
      </div>
    </section>
  );
}
