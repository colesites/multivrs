"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export interface WorkspaceMember {
  id: string;
  role: string;
  userId: string;
  user: { email: string; name: string };
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date | string;
}

interface WorkspaceTeam {
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
}

/** A workspace's members and pending invitations; `reload` refetches after a change. */
export function useWorkspaceMembers(organizationId: string) {
  const [team, setTeam] = useState<WorkspaceTeam | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!organizationId) return setTeam(null);
    try {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationId },
      });
      if (result.error || !result.data) {
        setError(result.error?.message ?? "Couldn't load the workspace.");
        return;
      }
      setError(null);
      setTeam({
        members: result.data.members,
        invitations: result.data.invitations.filter(
          (i) => i.status === "pending",
        ),
      });
    } catch {
      setError("Couldn't load the workspace.");
    }
  }, [organizationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { team, error, reload };
}
