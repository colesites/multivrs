"use client";

import { Filter, Layers, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { TemplateCard } from "./TemplateCard";
import { TemplateSheet } from "./TemplateSheet";
import type { MarketplaceTemplate } from "./template.types";

type TemplateMarketplaceProps = {
  categories: string[];
  templates: MarketplaceTemplate[];
};

export function TemplateMarketplace({
  categories,
  templates,
}: TemplateMarketplaceProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const allCategories = ["All templates", ...categories];
  const [activeCategory, setActiveCategory] = useState(allCategories[0]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedTemplate, setSelectedTemplate] =
    useState<MarketplaceTemplate | null>(null);

  const visibleTemplates = useMemo(() => {
    const filtered = templates.filter((template) => {
      const matchesCategory =
        activeCategory === "All templates" ||
        template.category === activeCategory;
      const searchTerms = [
        template.name || "",
        template.description || "",
        ...(template.stack || []),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchTerms.includes(query.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sort === "price-high") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }, [activeCategory, query, sort, templates]);

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <div className="flex flex-col gap-5 border-b border-white/8 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <nav
            aria-label="Template categories"
            className="-mx-2 flex max-w-full overflow-x-auto px-2"
          >
            {allCategories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  className={`shrink-0 cursor-pointer border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-white text-white"
                      : "border-transparent text-white/50 hover:text-white/80"
                  }`}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </nav>

          <div className="flex w-full gap-2.5 lg:w-auto">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-white/2 px-3 text-white/45 transition-colors focus-within:border-white/30 focus-within:bg-white/4 lg:w-72">
              <Search className="size-4" />
              <span className="sr-only">Search templates</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search templates, stack, keywords…"
                type="search"
                value={query}
              />
            </label>
            <Select onValueChange={setSort} value={sort}>
              <SelectTrigger
                className="size-10 cursor-pointer justify-center rounded-lg border-white/15 bg-white/2 p-0 text-white/70 hover:bg-white/6 hover:text-white"
                aria-label="Filter templates"
                hideChevron
              >
                <Filter className="size-4" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="end"
                className="w-48 rounded-lg border border-white/10 bg-[#141414]/95 backdrop-blur-xl text-white shadow-2xl"
              >
                <SelectItem
                  className="cursor-pointer rounded-md text-xs py-2 focus:bg-white/10 focus:text-white"
                  value="recent"
                >
                  Newest
                </SelectItem>
                <SelectItem
                  className="cursor-pointer rounded-md text-xs py-2 focus:bg-white/10 focus:text-white"
                  value="popular"
                >
                  Most popular
                </SelectItem>
                <SelectItem
                  className="cursor-pointer rounded-md text-xs py-2 focus:bg-white/10 focus:text-white"
                  value="price-low"
                >
                  Price: low to high
                </SelectItem>
                <SelectItem
                  className="cursor-pointer rounded-md text-xs py-2 focus:bg-white/10 focus:text-white"
                  value="price-high"
                >
                  Price: high to low
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {visibleTemplates.length > 0 ? (
          <div className="grid gap-x-8 gap-y-12 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTemplates.map((template) => (
              <TemplateCard
                key={template._id}
                onSelect={() => setSelectedTemplate(template)}
                template={template}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Layers className="size-10 text-white/20" />
            <h3 className="mt-4 font-semibold text-lg text-white">
              No templates found
            </h3>
            <p className="mt-1 text-sm text-white/50">
              Try adjusting your search or category filter.
            </p>
          </div>
        )}
      </section>

      {/* Slide-over Sheet Detail Drawer */}
      <TemplateSheet
        onClose={() => setSelectedTemplate(null)}
        template={selectedTemplate}
        user={user}
      />
    </>
  );
}
