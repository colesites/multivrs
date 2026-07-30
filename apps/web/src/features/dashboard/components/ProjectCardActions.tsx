"use client";

import { MoreHorizontal, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { readableError, requestOk } from "@/lib/api/request.client";

export function ProjectCardActions({
  href,
  projectId,
  projectName,
}: {
  href: string;
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function removeProject() {
    if (deleting) return;
    setDeleting(true);
    void requestOk(
      `/api/projects/${projectId}`,
      { method: "DELETE" },
      "Project deletion failed",
    )
      .then(() => {
        toast.success(`${projectName} deleted`);
        setConfirmOpen(false);
        router.refresh();
      })
      .catch((error: unknown) => {
        toast.error(readableError(error, "Project deletion failed"));
      })
      .finally(() => setDeleting(false));
  }

  return (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Open ${projectName} actions`}
            className="text-muted-foreground hover:text-foreground"
            size="icon-sm"
            variant="ghost"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`${href}/settings`}>
              <Settings />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {projectName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the project, its deployments, logs, and
            project settings. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={removeProject}
            variant="destructive"
          >
            {deleting ? "Deleting…" : "Delete project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
