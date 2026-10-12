"use client";

import type { Project } from "@multivrs/client";
import { projectSchema } from "@multivrs/client";
import { FRAMEWORK_IDS } from "@multivrs/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { readableError, requestOk } from "@/lib/api/request.client";

interface ProjectSettingsPageProps {
  project: Project;
  username: string;
}

export function ProjectSettingsPage({
  project,
  username,
}: ProjectSettingsPageProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<{
    name?: string;
    framework?: string;
    repositoryUrl?: string;
  }>({});
  const [busy, setBusy] = useState<"delete" | "save" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const name = draft.name ?? project.name;
  const framework = draft.framework ?? project.framework ?? "auto";
  const repositoryUrl = draft.repositoryUrl ?? project.repositoryUrl ?? "";

  function save() {
    if (busy) return;
    setBusy("save");
    void requestOk(
      `/api/projects/${project.id}`,
      {
        body: JSON.stringify({
          framework: framework === "auto" ? null : framework,
          name,
          repositoryUrl: repositoryUrl.trim() || null,
        }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      },
      "Project update failed",
    )
      .then((response) => response.json())
      .then((body) => projectSchema.parse(body))
      .then(() => {
        toast.success("Project settings saved");
        router.refresh();
      })
      .catch((error: unknown) =>
        toast.error(readableError(error, "Project update failed")),
      )
      .finally(() => setBusy(null));
  }

  function remove() {
    if (busy) return;
    setBusy("delete");
    void requestOk(
      `/api/projects/${project.id}`,
      {
        method: "DELETE",
      },
      "Project deletion failed",
    )
      .then(() => {
        toast.success("Project deleted");
        router.replace(`/${username}`);
        router.refresh();
      })
      .catch((error: unknown) => {
        toast.error(readableError(error, "Project deletion failed"));
        setBusy(null);
      });
  }

  return (
    <div className="w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title="Settings"
        description={<>Configure how {project.name} is identified and built.</>}
      />

      <section className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70">
        <div className="border-b border-(--hairline) px-5 py-4">
          <h2 className="text-sm font-semibold">General configuration</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Update your project's basic settings and deployment configuration.
          </p>
        </div>
        <div className="space-y-6 p-5">
          <label
            htmlFor="project-name"
            className="block max-w-xl space-y-2 text-xs text-muted-foreground"
          >
            <span>Project name</span>
            <Input
              id="project-name"
              value={name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <div className="block max-w-xl space-y-2 text-xs text-muted-foreground">
            <span>Framework preset</span>
            <Select
              value={framework}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, framework: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto detect</SelectItem>
                {FRAMEWORK_IDS.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <label
            htmlFor="project-repository-url"
            className="block max-w-xl space-y-2 text-xs text-muted-foreground"
          >
            <span>GitHub repository URL</span>
            <Input
              id="project-repository-url"
              inputMode="url"
              placeholder="https://github.com/owner/repository"
              value={repositoryUrl}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  repositoryUrl: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="flex items-center justify-between border-t border-(--hairline) bg-black/2 dark:bg-white/2 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Please use 32 characters at maximum.
          </p>
          <Button onClick={save} disabled={busy !== null || !name.trim()}>
            {busy === "save" ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/2">
        <div className="px-5 py-5">
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Delete project
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The project will be permanently deleted, including its deployments
            and domains. This action is irreversible and can not be undone.
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-red-500/20 bg-red-500/5 px-5 py-3">
          <p className="text-xs text-red-600 dark:text-red-400">
            Proceed with caution.
          </p>
          <Button
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={busy !== null}
          >
            {busy === "delete" ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </section>
      <ConfirmDialog
        busy={busy === "delete"}
        description="This permanently removes the project and all of its deployments. This can't be undone."
        onConfirm={remove}
        onOpenChange={setConfirmDelete}
        open={confirmDelete}
        title={`Delete ${project.name}?`}
      />
    </div>
  );
}
