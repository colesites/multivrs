"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import { GitHubRepositoryList } from "@/features/dashboard/components/GitHubRepositoryList";
import { useGithubRepositories } from "@/features/dashboard/hooks/useGithubRepositories";
import { githubImportHref } from "@/features/dashboard/lib/github-import";
import { authClient } from "@/lib/auth-client";
import type { GitHubRepository } from "@/lib/schemas/github.schemas";
import { githubRepositoryUrlSchema } from "@/lib/schemas/github.schemas";

export function NewProjectFlow({ username }: { username?: string }) {
  const router = useRouter();
  const github = useGithubRepositories();
  const [query, setQuery] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [importingId, setImportingId] = useState<number | null>(null);
  const repositories = github.repositories.filter((repository) =>
    repository.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function openRepository(repository: GitHubRepository) {
    setImportingId(repository.id);
    router.push(
      githubImportHref(repository, username ?? repository.owner.login),
    );
  }

  function importUrl() {
    const parsed = githubRepositoryUrlSchema.safeParse(repositoryUrl.trim());
    if (!parsed.success)
      return toast.error(
        parsed.error.issues[0]?.message ?? "Invalid GitHub URL",
      );
    const url = new URL(parsed.data);
    const [owner, rawName] = url.pathname.split("/").filter(Boolean);
    const name = rawName?.replace(/\.git$/, "");
    if (!owner || !name)
      return toast.error("Repository owner and name are required");
    openRepository({
      default_branch: "main",
      description: null,
      forks_count: 0,
      full_name: `${owner}/${name}`,
      html_url: parsed.data,
      id: Date.now(),
      language: null,
      name,
      owner: { avatar_url: `https://github.com/${owner}.png`, login: owner },
      private: false,
      stargazers_count: 0,
      updated_at: new Date().toISOString(),
    });
  }

  async function connect() {
    try {
      await authClient.linkSocial({
        callbackURL: "/new",
        provider: "github",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "GitHub connection failed",
      );
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 text-white">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
          New deployment
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Import a Git repository
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/45">
          Choose a repository, configure the detected framework, and run an
          isolated cloud build.
        </p>
      </header>
      <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3">
            <span className="sr-only">Repository URL</span>
            <GitHubMark className="size-4 text-white/40" />
            <input
              value={repositoryUrl}
              onChange={(event) => setRepositoryUrl(event.target.value)}
              placeholder="https://github.com/owner/repository"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            />
          </label>
          <button
            type="button"
            onClick={importUrl}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-black"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
        <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-wider text-white/25">
          <span className="h-px flex-1 bg-white/10" /> or choose from GitHub{" "}
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={connect}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs font-medium"
          >
            <GitHubMark className="size-4" />{" "}
            {github.connected ? github.owner : "Connect GitHub"}
          </button>
          <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/60 px-3">
            <span className="sr-only">Search repositories</span>
            <Search className="size-3.5 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search repositories"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            />
          </label>
        </div>
        <div className="divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10 bg-black/40">
          <GitHubRepositoryList
            error={github.error}
            importingId={importingId}
            loading={github.loading}
            onImport={openRepository}
            repositories={repositories}
          />
        </div>
      </section>
    </div>
  );
}
