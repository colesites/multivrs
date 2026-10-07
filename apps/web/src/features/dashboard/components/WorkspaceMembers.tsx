"use client";

import { RotateCw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  isWorkspaceRole,
  WORKSPACE_ROLES,
} from "@/features/dashboard/constants/workspace-roles";
import type { useWorkspaceMembers } from "@/features/dashboard/hooks/useWorkspaceMembers";
import { authClient } from "@/lib/auth-client";

const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm capitalize";

type Result = { error?: { message?: string } | null };

/** Members and pending invitations of one workspace: change roles, remove, resend, cancel. */
export function WorkspaceMembers({
  organizationId,
  workspace,
}: {
  organizationId: string;
  workspace: ReturnType<typeof useWorkspaceMembers>;
}) {
  const { data: session } = authClient.useSession();
  const { team, error, reload } = workspace;
  const [busy, setBusy] = useState<string | null>(null);

  async function act(key: string, work: () => Promise<Result>, done: string) {
    setBusy(key);
    try {
      const result = await work();
      if (result.error)
        toast.error(result.error.message ?? "That didn't work.");
      else {
        toast.success(done);
        await reload();
      }
    } catch {
      toast.error("That didn't work.");
    } finally {
      setBusy(null);
    }
  }

  if (!organizationId) return null;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!team) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const org = authClient.organization;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Members</h3>
        <ul className="divide-y divide-(--hairline) rounded-xl border border-(--hairline)">
          {team.members.map((member) => {
            const you = member.userId === session?.user.id;
            return (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {member.user.name || member.user.email}
                    {you && (
                      <span className="ml-2 text-xs text-purple-400">You</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
                <select
                  aria-label={`Role for ${member.user.email}`}
                  className={SELECT_CLASS}
                  disabled={busy !== null}
                  onChange={(event) => {
                    const role = event.target.value;
                    if (!isWorkspaceRole(role)) return;
                    void act(
                      member.id,
                      () =>
                        org.updateMemberRole({
                          memberId: member.id,
                          organizationId,
                          role,
                        }),
                      "Role updated.",
                    );
                  }}
                  value={member.role}
                >
                  {WORKSPACE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <Button
                  aria-label={you ? "Leave workspace" : "Remove member"}
                  disabled={busy !== null}
                  onClick={() =>
                    void act(
                      member.id,
                      () =>
                        you
                          ? org.leave({ organizationId })
                          : org.removeMember({
                              memberIdOrEmail: member.id,
                              organizationId,
                            }),
                      you ? "You left the workspace." : "Member removed.",
                    )
                  }
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
      {team.invitations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Pending invitations</h3>
          <ul className="divide-y divide-(--hairline) rounded-xl border border-(--hairline)">
            {team.invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{invitation.email}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {invitation.role} · expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  aria-label="Resend invitation"
                  disabled={busy !== null}
                  onClick={() =>
                    void act(
                      invitation.id,
                      () =>
                        org.inviteMember({
                          email: invitation.email,
                          organizationId,
                          resend: true,
                          role: isWorkspaceRole(invitation.role)
                            ? invitation.role
                            : "viewer",
                        }),
                      "Invitation sent again.",
                    )
                  }
                  size="icon"
                  variant="ghost"
                >
                  <RotateCw className="size-4" />
                </Button>
                <Button
                  aria-label="Cancel invitation"
                  disabled={busy !== null}
                  onClick={() =>
                    void act(
                      invitation.id,
                      () =>
                        org.cancelInvitation({ invitationId: invitation.id }),
                      "Invitation canceled.",
                    )
                  }
                  size="icon"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
