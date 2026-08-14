"use client";

import { CircleCheck, CircleX, Globe2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ImportDeploymentStatus } from "@/features/dashboard/hooks/useDeploymentImport";

export function DeploymentProgress({
  cancel,
  deploying,
  detailsUrl,
  logs,
  seconds,
  status,
}: {
  cancel: () => Promise<void>;
  deploying: boolean;
  detailsUrl?: string;
  logs: Array<{ id: string; message: string }>;
  seconds: number;
  status: ImportDeploymentStatus;
}) {
  const hasAttempt = status !== "idle";
  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#09090b] p-6">
      <h2 className="text-lg font-semibold">Deployment</h2>
      {!hasAttempt ? (
        <div className="mt-4 grid min-h-48 place-items-center rounded-xl border border-white/10 bg-black/60 text-center">
          <div>
            <Globe2 className="mx-auto size-8 text-white/30" />
            <p className="mt-3 text-xs text-white/40">
              Build progress and logs will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div
            className="flex items-center gap-2 text-xs text-white/60"
            aria-live="polite"
          >
            {status === "building" ? (
              <Loader2 className="size-4 animate-spin text-purple-400" />
            ) : status === "ready" ? (
              <CircleCheck className="size-4 text-emerald-400" />
            ) : (
              <CircleX className="size-4 text-rose-400" />
            )}
            {status === "building"
              ? `Building for ${seconds}s`
              : status === "ready"
                ? `Built in ${seconds}s`
                : status === "canceled"
                  ? `Canceled after ${seconds}s`
                  : `Deployment failed after ${seconds}s`}
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-black p-4 font-mono text-xs">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="text-white/30">›</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {deploying ? (
              <button
                type="button"
                onClick={cancel}
                className="h-9 rounded-lg border border-white/15 px-4 text-xs font-medium hover:bg-white/5"
              >
                Cancel deployment
              </button>
            ) : null}
            {detailsUrl ? (
              <Link
                href={detailsUrl}
                className="inline-flex h-9 items-center rounded-lg border border-white/15 px-4 text-xs font-medium hover:bg-white/5"
              >
                View deployment details
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
