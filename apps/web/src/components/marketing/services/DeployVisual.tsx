"use client";

import { useState } from "react";
import { GitBranch, Search, ChevronDown, ArrowRight } from "lucide-react";

export function DeployVisual() {
  const [gitUrl, setGitUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState("multivrs");

  const repos = [
    {
      avatar: "M",
      name: "multivrs",
      updated: "Updated 3d ago · TypeScript",
    },
    {
      avatar: "K",
      name: "kontinueai",
      updated: "Updated 9d ago · TypeScript",
    },
    {
      avatar: "S",
      name: "swift-rust",
      updated: "Updated 25d ago · TypeScript",
    },
    {
      avatar: "H",
      name: "hull-superstore",
      updated: "Updated 55d ago · TypeScript",
    },
    {
      avatar: "I",
      name: "image-slider-gallery",
      updated: "Updated 56d ago · TypeScript",
    },
  ];

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative w-full max-w-full lg:max-w-xl xl:max-w-2xl">
      {/* Wide horizontal white ambient light beam nestled right along the card top edge */}
      <div
        className="pointer-events-none absolute -top-8 inset-x-0 h-44 w-full"
        style={{
          background:
            "radial-gradient(ellipse 90% 75% at 50% 25%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 50%, transparent 80%)",
          filter: "blur(28px)",
        }}
        aria-hidden="true"
      />

      {/* Main card with smooth bottom fade into the black background */}
      <div
        className="relative rounded-2xl border border-white/10 bg-[#000000] p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 65%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0.1) 94%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, #000000 0%, #000000 65%, rgba(0,0,0,0.65) 82%, rgba(0,0,0,0.1) 94%, transparent 100%)",
        }}
      >
        {/* Header */}
        <div className="mb-3.5">
          <p className="font-mono text-[9px] font-semibold tracking-[0.2em] text-zinc-400 uppercase mb-1">
            New Deployment
          </p>
          <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1">
            Import a Git repository
          </h4>
          <p className="text-xs text-zinc-400 font-sans leading-tight">
            Choose a repository, configure the detected framework, and run an isolated cloud build.
          </p>
        </div>

        {/* Repository URL Input Bar */}
        <div className="mb-3.5 flex items-center justify-between gap-3 rounded-lg border border-white/15 bg-zinc-950 px-3 py-1.5 focus-within:border-white/40 transition-colors">
          <div className="flex flex-1 items-center gap-2.5">
            <svg className="size-3.5 shrink-0 fill-zinc-400" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <input
              type="text"
              value={gitUrl}
              onChange={(e) => setGitUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              className="w-full bg-transparent font-mono text-[11px] text-white placeholder:text-zinc-500 outline-none"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            <span>Continue</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-black px-2.5 font-mono text-[8px] tracking-widest text-zinc-500 uppercase">
            Or choose from GitHub
          </span>
        </div>

        {/* Filter bar */}
        <div className="mb-3 flex items-center justify-between gap-2.5">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:border-white/20 transition-colors"
          >
            <GitBranch className="size-3 text-zinc-400" />
            <span>colesites</span>
            <ChevronDown className="size-3 text-zinc-500" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-zinc-950/80 px-2.5 py-1 text-[11px] focus-within:border-white/30 transition-colors">
            <Search className="size-3 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full bg-transparent font-mono text-[11px] text-white placeholder:text-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Repository list (compact 3 items for sleek height) */}
        <div className="space-y-1 overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 p-1">
          {filteredRepos.slice(0, 3).map((repo) => {
            const isSelected = selectedRepo === repo.name;
            return (
              <div
                key={repo.name}
                onClick={() => setSelectedRepo(repo.name)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-white/[0.08] border border-white/15 shadow-sm"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-6 items-center justify-center rounded-full bg-zinc-800 font-mono text-[10px] font-bold text-white">
                    {repo.avatar}
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-semibold text-white">
                      {repo.name}
                    </p>
                    <p className="text-[9px] text-zinc-400 font-sans">
                      {repo.updated}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`rounded-full px-3 py-0.5 font-mono text-[10px] font-semibold transition-colors ${
                    isSelected
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Import
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom Black Gradient Fade Overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-2xl"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0.85) 75%, #000000 100%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
