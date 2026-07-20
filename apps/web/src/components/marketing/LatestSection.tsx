"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { BlogCover } from "@/components/marketing/art/blog-cover";
import { revealLines, revealUp, useGSAP, gsap, ScrollTrigger } from "@/components/marketing/scroll";
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
  const wrapperRef = useRef<HTMLDivElement>(null);
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

      // Horizontal Scroll Logic
      if (wrapperRef.current && gridRef.current) {
        const getScrollAmount = () => {
          const wrapperWidth = wrapperRef.current?.offsetWidth || 0;
          const viewportWidth = window.innerWidth;
          return -(wrapperWidth - viewportWidth + 100); // 100px padding
        };

        const tween = gsap.to(wrapperRef.current, {
          x: getScrollAmount,
          ease: "none",
        });

        ScrollTrigger.create({
          trigger: gridRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount() * -1}`,
          pin: true,
          animation: tween,
          scrub: 1,
          invalidateOnRefresh: true,
        });
      }
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="latest"
      className="relative mx-auto px-6 py-28 lg:px-10 lg:py-40" // Removed max-w-7xl to allow full horizontal stretch
    >
      <div className="mx-auto max-w-7xl flex flex-wrap items-end justify-between gap-6 px-6 lg:px-10">
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

      <div ref={gridRef} className="mt-14 h-screen flex flex-col justify-center overflow-hidden lg:mt-20">
        <div 
          ref={wrapperRef}
          className="flex w-max items-stretch gap-10 px-6 lg:px-10"
          style={{ perspective: "1500px" }}
        >
          {POSTS.map((post, i) => (
            <div key={post.slug} className="w-[85vw] sm:w-[500px] lg:w-[600px] flex-shrink-0" style={{ transformStyle: "preserve-3d" }}>
              <BlogCard
                post={post}
                featured={i === 0}
              />
            </div>
          ))}
        </div>
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
        "group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-3xl transition-all duration-700 will-change-transform hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)]",
        span,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden border-b border-white/5 mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity duration-700",
          featured ? "aspect-[16/8]" : "aspect-[16/9]",
        )}
      >
        <BlogCover
          variant={post.cover}
          className="transition-transform duration-1000 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
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
