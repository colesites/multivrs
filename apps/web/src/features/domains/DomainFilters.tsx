"use client";

import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AvailabilityFilter = "all" | "available";
export type DomainSort = "relevance" | "length" | "price" | "alphabetical";

export function DomainFilters({
  catalog,
  tld,
  onTldChange,
  availability,
  onAvailabilityChange,
  sort,
  onSortChange,
}: {
  catalog: string[];
  tld: string;
  onTldChange: (value: string) => void;
  availability: AvailabilityFilter;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  sort: DomainSort;
  onSortChange: (value: DomainSort) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = catalog
    .filter((item) => item.includes(query.toLowerCase()))
    .slice(0, 120);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <details className="group relative">
        <summary className="flex h-9 cursor-pointer list-none items-center gap-2 border border-white/15 bg-black px-3 text-xs text-white/75">
          {tld ? `.${tld}` : "All TLDs"}
          <ChevronDown className="size-3.5" />
        </summary>
        <div className="absolute right-0 z-30 mt-1 w-64 border border-white/15 bg-[#080808] shadow-2xl">
          <label className="relative block border-b border-white/10 p-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search TLDs"
              className="h-9 w-full bg-transparent pl-9 text-sm outline-hidden"
            />
          </label>
          <div className="max-h-72 overflow-y-auto p-1">
            <button
              type="button"
              onClick={() => onTldChange("")}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-white/8"
            >
              All TLDs
            </button>
            {visible.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onTldChange(item)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-white/8"
              >
                .{item}
              </button>
            ))}
          </div>
        </div>
      </details>
      <FilterSelect
        value={availability}
        onChange={(value) => onAvailabilityChange(value as AvailabilityFilter)}
        options={[
          ["all", "Show All"],
          ["available", "Available"],
        ]}
      />
      <FilterSelect
        value={sort}
        onChange={(value) => onSortChange(value as DomainSort)}
        options={[
          ["relevance", "Relevance"],
          ["length", "Length"],
          ["price", "Price"],
          ["alphabetical", "Alphabetical"],
        ]}
      />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 rounded-none border-white/15 bg-[#080808] text-xs text-white/75">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="end"
        className="rounded-none border border-white/15 bg-[#080808] text-white"
      >
        {options.map(([option, label]) => (
          <SelectItem
            key={option}
            value={option}
            className="rounded-none text-xs focus:bg-white/10 focus:text-white"
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
