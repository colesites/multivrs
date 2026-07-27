"use client";

import { ChevronRight, Plus, Trash2 } from "lucide-react";
import type {
  DeploymentImportConfig,
  EnvironmentDraft,
} from "@/features/dashboard/types/deployment-import.types";

export function EnvironmentDraftEditor({
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
  function update(id: string, patch: Partial<EnvironmentDraft>) {
    onChange({
      ...config,
      environment: config.environment.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  }
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 p-3.5 text-xs font-medium text-white/80"
      >
        <ChevronRight className={open ? "size-3.5 rotate-90" : "size-3.5"} />{" "}
        Environment variables
      </button>
      {open ? (
        <div className="space-y-3 p-4 pt-0">
          {config.environment.map((item) => (
            <div key={item.id} className="flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Variable name</span>
                <input
                  value={item.key}
                  onChange={(event) =>
                    update(item.id, { key: event.target.value })
                  }
                  placeholder="EXAMPLE_KEY"
                  className="h-9 w-full rounded-md border border-white/10 bg-black px-3 font-mono text-xs outline-none"
                />
              </label>
              <label className="min-w-0 flex-1">
                <span className="sr-only">Variable value</span>
                <input
                  value={item.value}
                  onChange={(event) =>
                    update(item.id, { value: event.target.value })
                  }
                  placeholder="value"
                  className="h-9 w-full rounded-md border border-white/10 bg-black px-3 font-mono text-xs outline-none"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    environment: config.environment.filter(
                      (entry) => entry.id !== item.id,
                    ),
                  })
                }
                className="p-2 text-white/40 hover:text-red-400"
                aria-label="Remove variable"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...config,
                environment: [
                  ...config.environment,
                  { id: crypto.randomUUID(), key: "", value: "" },
                ],
              })
            }
            className="flex items-center gap-1.5 text-xs font-medium text-blue-400"
          >
            <Plus className="size-3.5" /> Add variable
          </button>
        </div>
      ) : null}
    </section>
  );
}
