"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { FaqItem } from "@/sanity/lib/faq-service";

interface FaqSectionProps {
  faqs?: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function FaqSection({
  faqs = [],
  title = "Frequently asked questions",
  subtitle,
}: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?._id ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const categories = [
    "All",
    ...Array.from(
      new Set(
        faqs
          .map((item) => item.category)
          .filter((c): c is string => Boolean(c)),
      ),
    ),
  ];

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((item) => item.category === selectedCategory);

  const toggleItem = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="relative w-full border-t border-border bg-background py-24 text-foreground">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Left Column: Heading & Dynamic Categories from Sanity */}
          <div className="lg:col-span-5">
            <h2 className="font-sans text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              {title}
            </h2>

            {subtitle ? (
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground font-sans">
                {subtitle}
              </p>
            ) : null}

            {/* Dynamic Categories from declared Sanity category documents */}
            {categories.length > 2 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    aria-pressed={selectedCategory === cat}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-foreground text-background font-semibold shadow-lg shadow-foreground/10"
                        : "border border-border bg-foreground/5 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Right Column: Numbered Vercel Accordion List */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-border border-t border-b border-border">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openId === faq._id;
                const formattedIndex = (index + 1).toString().padStart(2, "0");

                return (
                  <div key={faq._id} className="group py-5 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleItem(faq._id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-4 text-left focus:outline-hidden cursor-pointer"
                    >
                      <div className="flex items-start gap-4 sm:gap-6">
                        <span className="font-mono text-sm font-semibold text-muted-foreground group-hover:text-foreground/60 transition-colors pt-0.5">
                          {formattedIndex}
                        </span>
                        <span className="font-sans text-lg font-medium text-foreground group-hover:text-foreground/90 transition-colors">
                          {faq.question}
                        </span>
                      </div>

                      <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-foreground/5 text-muted-foreground transition-colors group-hover:border-foreground/30 group-hover:text-foreground">
                        {isOpen ? (
                          <Minus className="size-3.5" />
                        ) : (
                          <Plus className="size-3.5" />
                        )}
                      </span>
                    </button>

                    {/* Expandable Answer */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pl-9 text-sm leading-relaxed text-muted-foreground sm:pl-12 font-sans">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
