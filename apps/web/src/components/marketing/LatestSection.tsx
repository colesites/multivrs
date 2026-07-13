"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { BlogCover } from "@/components/marketing/art/blog-cover";
import { revealLines, revealUp, useGSAP } from "@/components/marketing/scroll";
import { POSTS, type Post } from "@/lib/marketing/posts";
import { cn } from "@/lib/utils";

/** Bento spans for the four cards (4+2 / 3+3 on lg). First card is featured. */
const SPANS = [
  "lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
];

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function LatestSection() {
  const root = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;

      revealLines(headingRef.current, { start: "top 85%" });
      revealUp(root.current.querySelectorAll<HTMLElement>("[data-reveal]"), {
        trigger: root.current,
        start: "top 80%",
        y: 24,
      });
      revealUp(gridRef.current?.querySelectorAll<HTMLElement>("[data-card]"), {
        trigger: gridRef.current,
        start: "top 82%",
        y: 40,
        stagger: 0.1,
        duration: 0.9,
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="latest"
      className="relative mx-auto max-w-7xl px-6 py-28 lg:px-10 lg:py-40"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p
            data-reveal
            className="mb-5 font-mono text-xs tracking-[0.25em] text-white/40 uppercase"
          >
            Latest
          </p>
          <h2
            ref={headingRef}
            className="font-clash text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white"
          >
            Fresh from the Multivrs blog.
          </h2>
        </div>
        <Link
          data-reveal
          href="/blog"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          View all posts
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div
        ref={gridRef}
        className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5"
      >
        {POSTS.map((post, i) => (
          <BlogCard
            key={post.slug}
            post={post}
            featured={i === 0}
            span={SPANS[i]}
          />
        ))}
      </div>
    </section>
  );
}

function BlogCard({
  post,
  featured,
  span,
}: {
  post: Post;
  featured: boolean;
  span?: string;
}) {
  return (
    <Link
      data-card
      href={`/blog/${post.slug}`}
      className={cn(
        "card-grain group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] transition-[border-color] duration-500 will-change-transform hover:border-white/25",
        span,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/10",
          featured ? "aspect-[16/8]" : "aspect-[16/9]",
        )}
      >
        <BlogCover
          variant={post.cover}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="mb-4 flex items-center gap-2.5 font-mono text-[0.65rem] tracking-wider text-white/40 uppercase">
          <span className="text-white/55">{post.category}</span>
          <span className="size-0.5 rounded-full bg-white/30" />
          <span>{dateFmt.format(new Date(post.publishedAt))}</span>
          <span className="size-0.5 rounded-full bg-white/30" />
          <span>{post.readingTime} min read</span>
        </div>

        <h3
          className={cn(
            "font-clash font-semibold tracking-tight text-white transition-colors group-hover:text-white",
            featured ? "text-2xl sm:text-3xl" : "text-xl",
          )}
        >
          {post.title}
        </h3>

        <p className="mt-3 line-clamp-2 max-w-prose font-acari text-sm leading-relaxed text-white/50">
          {post.excerpt}
        </p>

        <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/55 transition-colors group-hover:text-white">
          Read more
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
