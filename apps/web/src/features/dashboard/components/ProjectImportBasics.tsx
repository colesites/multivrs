import { FRAMEWORK_IDS } from "@multivrs/config";
import { Folder } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitHubMark } from "@/features/dashboard/components/GitHubMark";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

const LABELS: Record<(typeof FRAMEWORK_IDS)[number], string> = {
  go: "Go",
  h3: "h3",
  hono: "Hono",
  nextjs: "Next.js",
  node: "Node.js / Bun",
  python: "Python",
  remix: "Remix",
  ruby: "Ruby",
  static: "Static",
  "swift-rust": "swift-rust",
  vite: "Vite",
};

export function ProjectImportBasics({
  config,
  onChange,
  source,
}: {
  config: DeploymentImportConfig;
  onChange: (config: DeploymentImportConfig) => void;
  source: RepositorySource;
}) {
  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 font-mono text-xs">
        <GitHubMark className="size-4" />
        <span className="font-semibold">
          {source.owner}/{source.name}
        </span>
        <span className="text-white/30">•</span>
        <span>{source.branch}</span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1">
          <Folder className="size-3" /> {config.rootDirectory}
        </span>
      </div>
      {!source.url ? (
        <p className="mt-4 border border-red-500/25 bg-red-500/5 p-3 text-xs text-red-300">
          Select a GitHub repository before deploying.
        </p>
      ) : null}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-xs text-white/60">
          <span>Workspace</span>
          <div className="flex h-10 items-center rounded-lg border border-white/10 bg-black/60 px-3 text-white">
            <span className="mr-2 size-2 rounded-full bg-emerald-500" />
            {source.team}
          </div>
        </div>
        <label className="space-y-2 text-xs text-white/60">
          <span>Project name</span>
          <input
            value={config.projectName}
            onChange={(event) =>
              onChange({ ...config, projectName: event.target.value })
            }
            className="h-10 w-full rounded-lg border border-white/10 bg-black/60 px-3 text-white outline-none focus:border-white/30"
          />
        </label>
        <div className="space-y-2 text-xs text-white/60">
          <span>Framework</span>
          <Select
            value={config.framework}
            onValueChange={(value) => {
              const framework = FRAMEWORK_IDS.find((id) => id === value);
              if (framework) onChange({ ...config, framework });
            }}
          >
            <SelectTrigger className="bg-black/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRAMEWORK_IDS.map((id) => (
                <SelectItem key={id} value={id}>
                  {LABELS[id]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="space-y-2 text-xs text-white/60">
          <span>Root directory</span>
          <input
            value={config.rootDirectory}
            onChange={(event) =>
              onChange({ ...config, rootDirectory: event.target.value })
            }
            className="h-10 w-full rounded-lg border border-white/10 bg-black/60 px-3 font-mono text-white outline-none focus:border-white/30"
          />
        </label>
      </div>
    </>
  );
}
