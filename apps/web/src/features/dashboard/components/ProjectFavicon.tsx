"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

function directImageLoader({ src }: ImageLoaderProps) {
  return src;
}

export function ProjectFavicon({
  className,
  name,
  url,
}: {
  className?: string;
  name: string;
  url: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const src = !url || failed ? "/logo.png" : url;

  return (
    <Image
      alt={`${name} favicon`}
      className={cn("size-10 rounded-[10px] object-contain", className)}
      height={40}
      loader={directImageLoader}
      onError={() => setFailed(true)}
      src={src}
      unoptimized
      width={40}
    />
  );
}
