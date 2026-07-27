"use client";

import { Loader2 } from "lucide-react";
import SpecularButton from "@/components/SpecularButton";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";

function relativeTime(raw: string): string {
  const timestamp = new Date(raw).getTime();
  if (!Number.isFinite(timestamp)) return "Unknown";
  const hours = Math.max(1, Math.floor((Date.now() - timestamp) / 3_600_000));
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`;
}

export function GitHubRepositoryList({
  error,
  importingId,
  loading,
  onImport,
  repositories,
}: {
  error?: string;
  importingId: number | null;
  loading: boolean;
  onImport: (repository: GitHubRepository) => void;
  repositories: GitHubRepository[];
}) {
  if (loading)
    return (
      <div className="flex h-40 items-center justify-center gap-2 text-xs text-white/40">
        <Loader2 className="size-4 animate-spin" /> Fetching repositories…
      </div>
    );
  if (!repositories.length)
    return (
      <div className="py-12 text-center text-xs text-white/40">
        {error ?? "No repositories found"}
      </div>
    );
  return repositories.map((repository) => (
    <div
      key={repository.id}
      className="flex items-center gap-4 p-3.5 hover:bg-white/[0.025]"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-xs font-bold uppercase">
        {repository.name[0]}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {repository.name}
          </span>
          {repository.private ? (
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50">
              Private
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs text-white/40">
          Updated {relativeTime(repository.updated_at)} ·{" "}
          {repository.language ?? "Unknown framework"}
        </span>
      </span>
      <SpecularButton
        size="sm"
        tint="#ffffff"
        tintOpacity={0.9}
        lineColor="#ffffff"
        baseColor="#ffffff"
        textColor="#000000"
        disabled={importingId !== null}
        onClick={() => onImport(repository)}
        className="h-8! px-4! text-xs! font-semibold"
      >
        {importingId === repository.id ? (
          <span className="flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" /> Opening
          </span>
        ) : (
          "Import"
        )}
      </SpecularButton>
    </div>
  ));
}
