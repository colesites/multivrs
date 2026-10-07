/**
 * Account-owned records (domains, mail): the owner, and people on the
 * owner's team with a role that allows the action.
 */
export type AccountAction = "read" | "manage" | "billing" | "delete";

/** What each team role may do with the account's records. */
export function canAccount(role: string, action: AccountAction): boolean {
  if (role === "owner" || role === "admin") return true;
  if (action === "read") return true;
  if (action === "manage") return role === "developer";
  if (action === "billing") return role === "billing";
  return false;
}

/** Records the user owns, or that belong to an account whose team they're on. */
export function ownedOrTeamWhere(userId: string) {
  return [
    { userId },
    { user: { accountTeam: { members: { some: { userId } } } } },
  ];
}

/** Selects the viewer's role on the owner's team, for `accountRole`. */
export function accountRoleSelect(viewerId: string) {
  return {
    accountTeam: {
      select: {
        members: {
          where: { userId: viewerId },
          select: { role: true },
          take: 1,
        },
      },
    },
  } as const;
}

/** "owner" for the record's owner, else their role on the owner's team. */
export function accountRole(
  viewerId: string,
  record: {
    userId: string;
    user: { accountTeam: { members: { role: string }[] } | null };
  },
): string | undefined {
  if (record.userId === viewerId) return "owner";
  return record.user.accountTeam?.members[0]?.role;
}
