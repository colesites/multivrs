"use client";

import { Eye, Heart, Layers } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "./template.types";

export function TemplateCard({
  onSelect,
  template,
}: {
  onSelect: () => void;
  template: MarketplaceTemplate;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(template.likes ?? 0);

  useEffect(() => {
    setLikeCount(template.likes ?? 0);
  }, [template.likes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`template_liked_${template._id}`);
      if (stored === "true") {
        setIsLiked(true);
      }
    }
  }, [template._id]);

  // Sync view count on mount once per browser session
  useEffect(() => {
    const key = `template_viewed_${template._id}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      void fetch(`/api/templates/${template._id}/view`, {
        method: "POST",
      }).catch(() => {});
    }
  }, [template._id]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !isLiked;
    const delta = nextLiked ? 1 : -1;
    setIsLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + delta));

    if (typeof window !== "undefined") {
      if (nextLiked) {
        localStorage.setItem(`template_liked_${template._id}`, "true");
      } else {
        localStorage.removeItem(`template_liked_${template._id}`);
      }
    }

    void fetch(`/api/templates/${template._id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    }).catch(() => {});
  };

  const sellerName =
    template.seller?.name || template.seller?.username || "Seller";
  const sellerInitial = (sellerName || "S").charAt(0).toUpperCase();
  const sellerImage = template.seller?.image;

  return (
    <div className="group flex flex-col">
      {/* 1. Preview Card: Image Only Widescreen Rectangle */}
      <button
        className="relative aspect-16/10 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121212] cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        onClick={onSelect}
        type="button"
      >
        {template.imageUrl ? (
          <Image
            alt={template.name}
            className="size-full object-cover object-center"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            src={template.imageUrl}
          />
        ) : (
          <div className="relative size-full flex flex-col items-center justify-center bg-linear-to-br from-white/5 via-white/1 to-black p-4">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_70%)]" />
            <div className="relative flex flex-col items-center gap-2 text-white/35 transition-colors group-hover:text-white/60">
              <Layers className="size-8 stroke-[1.25]" />
              <span className="font-mono text-[10px] tracking-widest uppercase">
                {template.category}
              </span>
            </div>
          </div>
        )}
      </button>

      {/* 2. Under Each Card: Seller Profile, Name, Likes & Views */}
      <div className="mt-3.5 flex items-center justify-between px-1">
        {/* Left: Seller avatar & Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-6 shrink-0 overflow-hidden rounded-full border border-white/15 bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-white/70">
            {sellerImage ? (
              <Image
                alt={sellerName}
                className="size-full object-cover"
                height={24}
                src={sellerImage}
                unoptimized
                width={24}
              />
            ) : (
              sellerInitial
            )}
          </div>
          <span className="truncate text-xs font-semibold text-white/90 transition-colors group-hover:text-white">
            {sellerName}
          </span>
        </div>

        {/* Right: Likes & Views */}
        <div className="flex items-center gap-3.5 shrink-0 text-xs text-white/50">
          <button
            aria-label={`Like ${template.name}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            onClick={handleLike}
            type="button"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isLiked && "fill-rose-500 text-rose-500",
              )}
            />
            <span className={cn("font-medium", isLiked && "text-rose-400")}>
              {likeCount}
            </span>
          </button>
          <div className="flex items-center gap-1.5" title="Views">
            <Eye className="size-4" />
            <span className="font-medium">
              {(template.views ?? 0) >= 1000
                ? `${((template.views ?? 0) / 1000).toFixed(0)}k`
                : `${template.views ?? 0}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
