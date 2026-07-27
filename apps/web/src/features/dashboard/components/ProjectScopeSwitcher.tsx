"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ProjectScopeMenu } from "@/features/dashboard/components/ProjectScopeMenu";
import { buildNavHref } from "@/features/dashboard/constants/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";

export interface ProjectOption {
  slug: string;
  name: string;
}

export function ProjectScopeSwitcher({
  projects = [],
}: {
  projects?: ProjectOption[];
}) {
  const router = useRouter();
  const { username, scope, activeSlug, isAllProjects } = useDashboardScope();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = projects.filter((project) =>
    project.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const close = () => {
    setOpen(false);
    setQuery("");
  };
  const select = (nextScope: string) => {
    close();
    router.push(buildNavHref(username, nextScope, activeSlug));
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-2 rounded-lg border border-[var(--hairline)] bg-white/[0.02] px-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-[var(--hairline-strong)] hover:bg-white/[0.04]"
      >
        <span className="max-w-[180px] truncate">
          {isAllProjects ? "All Projects" : scope}
        </span>
        <ChevronsUpDown className="size-3.5 text-muted-foreground/70" />
      </button>
      {open ? (
        <ProjectScopeMenu
          currentScope={scope}
          inputRef={inputRef}
          isAllProjects={isAllProjects}
          projects={filtered}
          query={query}
          onCreate={() => {
            close();
            router.push("/new");
          }}
          onQueryChange={setQuery}
          onSelect={select}
        />
      ) : null}
    </div>
  );
}
