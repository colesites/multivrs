"use client";

import { ArrowRight, ExternalLink, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "./template.types";

export function TemplateSheet({
  onClose,
  template,
  user,
}: {
  onClose: () => void;
  template: MarketplaceTemplate | null;
  user?: {
    name?: string | null;
    image?: string | null;
    username?: string | null;
  } | null;
}) {
  if (!template) return null;
  const isFree = template.price === 0;
  const ctaHref = user?.username ? `/${user.username}/~/templates` : "/signup";

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={!!template}>
      <SheetContent
        className="h-dvh max-h-dvh w-screen max-w-none overflow-y-auto border-t border-(--hairline) bg-[#0b0b0b] text-white p-0 sm:max-w-none"
        side="bottom"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-(--hairline) bg-[#0b0b0b]/95 px-5 py-5 backdrop-blur-md lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-semibold text-white sm:text-2xl">
                {template.name}
              </SheetTitle>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/80">
                {template.category}
              </span>
            </div>
            <div className="flex items-center gap-3 mr-8">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-sm font-semibold",
                  isFree
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                    : "border-white/20 bg-white/10 text-white",
                )}
              >
                {isFree ? "Free" : `$${template.price}`}
              </span>
            </div>
          </div>
        </SheetHeader>

        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Image banner */}
            <div className="lg:col-span-7">
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-white/10 bg-[#121212] shadow-2xl">
                {template.imageUrl ? (
                  <Image
                    alt={template.name}
                    className="size-full object-cover object-center"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    src={template.imageUrl}
                  />
                ) : (
                  <div className="relative size-full flex flex-col items-center justify-center bg-linear-to-br from-white/6 via-white/1 to-black p-6">
                    <div className="absolute inset-0 bg-radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_70%)]" />
                    <div className="relative flex flex-col items-center gap-2 text-white/40">
                      <Layers className="size-12 stroke-[1.25]" />
                      <span className="font-mono text-xs tracking-widest uppercase">
                        {template.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Overview, CTAs, Stack */}
            <div className="flex flex-col lg:col-span-5">
              <SheetDescription className="text-base leading-relaxed text-white/75">
                {template.description}
              </SheetDescription>

              {/* Action CTAs */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {template.previewUrl && (
                  <a
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/15"
                    href={template.previewUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="size-4" />
                    Live preview
                  </a>
                )}
                <Link
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                  href={ctaHref}
                >
                  {isFree ? "Use template" : `Purchase for $${template.price}`}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {/* Tech Stack List */}
              {template.stack?.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                    Built with
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.stack.map((tech) => (
                      <span
                        className="inline-flex items-center rounded-md border border-white/10 bg-white/4 px-3 py-1 font-mono text-xs text-white/80"
                        key={tech}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                  Template Overview
                </h3>
                <dl className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3.5">
                    <dt className="text-white/40">Seller</dt>
                    <dd className="mt-1 font-medium text-white/90">
                      {template.seller?.name ||
                        template.seller?.username ||
                        "Seller"}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3.5">
                    <dt className="text-white/40">Category</dt>
                    <dd className="mt-1 font-medium text-white/90">
                      {template.category}
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3.5">
                    <dt className="text-white/40">License</dt>
                    <dd className="mt-1 font-medium text-white/90">
                      Standard Commercial
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3.5">
                    <dt className="text-white/40">Support</dt>
                    <dd className="mt-1 font-medium text-white/90">
                      Community & Updates
                    </dd>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3.5">
                    <dt className="text-white/40">Format</dt>
                    <dd className="mt-1 font-medium text-white/90">
                      GitHub Repository
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
