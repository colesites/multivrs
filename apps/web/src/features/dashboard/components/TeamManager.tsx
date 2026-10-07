"use client";

import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { responseError } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkspaceMembers } from "@/features/dashboard/components/WorkspaceMembers";
import {
  INVITE_ROLES,
  type InviteRole,
  isInviteRole,
} from "@/features/dashboard/constants/workspace-roles";
import { useWorkspaceMembers } from "@/features/dashboard/hooks/useWorkspaceMembers";
import { authClient } from "@/lib/auth-client";

interface TeamState {
  team: { id: string; name: string; slug: string } | null;
  joined: Array<{
    organizationId: string;
    role: string;
    name: string;
    username: string;
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
    blocker: string | null;
  }>;
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm capitalize";

/**
 * Your account's team: people you invite open and work on all your
 * projects, with the role you give them. There's nothing to create first.
 */
export function TeamManager() {
  const [state, setState] = useState<TeamState | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("developer");
  const [loading, setLoading] = useState(false);
  const [otherId, setOtherId] = useState("");
  const members = useWorkspaceMembers(state?.team?.id ?? "");
  const other = useWorkspaceMembers(otherId);

  const load = useCallback(async () => {
    const response = await fetch("/api/team").catch(() => null);
    if (!response?.ok) {
      toast.error(await responseError(response, "Couldn't load your team."));
      return;
    }
    setState((await response.json()) as TeamState);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function teamId(): Promise<string | null> {
    if (state?.team) return state.team.id;
    const response = await fetch("/api/team", { method: "POST" }).catch(
      () => null,
    );
    if (!response?.ok) {
      toast.error(await responseError(response, "Couldn't set up your team."));
      return null;
    }
    const team = (await response.json()) as NonNullable<TeamState["team"]>;
    setState((current) => (current ? { ...current, team } : current));
    return team.id;
  }

  async function invite() {
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const organizationId = await teamId();
      if (!organizationId) return;
      const result = await authClient.organization.inviteMember({
        email: email.trim(),
        organizationId,
        role,
      });
      if (result.error) {
        toast.error(result.error.message ?? "Invitation failed.");
        return;
      }
      setEmail("");
      toast.success("Invitation sent.");
      await members.reload();
    } catch {
      toast.error("Invitation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function adopt(organizationId: string) {
    setLoading(true);
    const response = await fetch("/api/team/adopt", {
      body: JSON.stringify({ organizationId }),
      headers: { "content-type": "application/json" },
      method: "POST",
    }).catch(() => null);
    setLoading(false);
    if (!response?.ok) {
      toast.error(await responseError(response, "That didn't work."));
      return;
    }
    toast.success("It's your team now. Its members can open your projects.");
    setOtherId("");
    await load();
  }

  const adoptable = state?.team
    ? []
    : (state?.workspaces ?? []).filter((w) => w.blocker === null);
  const others = (state?.workspaces ?? []).filter(
    (w) => !adoptable.includes(w),
  );

  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="team-title"
    >
      <div className="border-b border-(--hairline) px-5 py-4">
        <h2 className="text-sm font-semibold" id="team-title">
          Team
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          People on your team open and work on all your projects. Their role
          decides what they can change.
        </p>
      </div>

      {adoptable.map((workspace) => (
        <div
          key={workspace.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-(--hairline) bg-purple-400/[0.05] px-5 py-4"
        >
          <p className="text-sm text-muted-foreground">
            You invited people to “{workspace.name}” before teams existed. Make
            it your team so they can open your projects. Nobody needs a new
            invite.
          </p>
          <Button disabled={loading} onClick={() => void adopt(workspace.id)}>
            Make it my team
          </Button>
        </div>
      ))}

      <div className="space-y-3 p-5">
        <h3 className="text-sm font-medium">Invite someone</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <select
              className={SELECT_CLASS}
              id="member-role"
              onChange={(event) => {
                if (isInviteRole(event.target.value)) {
                  setRole(event.target.value);
                }
              }}
              value={role}
            >
              {INVITE_ROLES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Button
            disabled={loading || !email || !state}
            onClick={() => void invite()}
          >
            <UserPlus className="size-4" />
            Send invitation
          </Button>
        </div>
      </div>

      <div className="border-t border-(--hairline) p-5">
        {state?.team ? (
          <WorkspaceMembers
            organizationId={state.team.id}
            workspace={members}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            It's just you for now.
          </p>
        )}
      </div>

      {state && state.joined.length > 0 && (
        <div className="space-y-2 border-t border-(--hairline) p-5">
          <h3 className="text-sm font-medium">Teams you're on</h3>
          <ul className="divide-y divide-(--hairline) rounded-xl border border-(--hairline)">
            {state.joined.map((team) => (
              <li
                key={team.organizationId}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{team.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {team.role}
                  </p>
                </div>
                <Link
                  className="text-sm font-medium text-purple-400"
                  href={`/${team.username}`}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-3 border-t border-(--hairline) p-5">
          <h3 className="text-sm font-medium">Other workspaces</h3>
          <select
            aria-label="Workspace"
            className={SELECT_CLASS}
            onChange={(event) => setOtherId(event.target.value)}
            value={otherId}
          >
            <option value="">Choose a workspace to manage</option>
            {others.map((workspace) => (
              <option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </option>
            ))}
          </select>
          {otherId && (
            <WorkspaceMembers organizationId={otherId} workspace={other} />
          )}
        </div>
      )}
    </section>
  );
}
