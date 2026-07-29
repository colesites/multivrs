"use client";

import { ChevronRight } from "lucide-react";
import type { DeploymentImportConfig } from "@/features/dashboard/types/deployment-import.types";

export function BuildSettingsFields({
  config,
  onChange,
  open,
  onToggle,
}: {
  config: DeploymentImportConfig;
  onChange: (config: DeploymentImportConfig) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const fields = [
    ["Build command", "buildCommand", "Detected from framework"],
    ["Output directory", "outputDirectory", "Detected from framework"],
    ["Install command", "installCommand", "Detected from lockfile"],
  ] as const;
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 p-3.5 text-xs font-medium text-white/80"
      >
        <ChevronRight className={open ? "size-3.5 rotate-90" : "size-3.5"} />{" "}
        Build and output settings
      </button>
      {open ? (
        <div className="space-y-3 p-4 pt-0">
          {fields.map(([label, key, placeholder]) => (
            <label key={key} className="block space-y-1 text-xs text-white/60">
              <span>{label}</span>
              <input
                value={config[key]}
                placeholder={placeholder}
                onChange={(event) =>
                  onChange({ ...config, [key]: event.target.value })
                }
                className="h-9 w-full rounded-md border border-white/10 bg-black px-3 text-xs text-white outline-hidden focus:border-white/30"
              />
            </label>
          ))}
        </div>
      ) : null}
    </section>
  );
}
